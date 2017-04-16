require 'colorize'
require 'singleton'
require_relative './callbacks'
require_relative './serializer'
require_relative './synchronizer'
require_relative './registry'

module Happybara
  class Agent
    include Callbacks

    attr_accessor :grace_timeout

    # Create a new Agent instance and configure it.
    #
    # @yield [Happybara::Agent] instance
    #        The new agent instance. The block will evaluated in this instance's
    #        scope so you can call methods like #on and #before() globally.
    #
    # @return [Happybara::Agent]
    def self.create(&block)
      Happybara::Agent.new.tap do |instance|
        instance.instance_exec do
          block[self]
        end
      end
    end

    def initialize(serializer: Serializer.new)
      @serializer = serializer
      @reflections = {}
      @mutex = Synchronizer.new({
        on_abrupt_termination: ->() {
          run_callbacks(:abrupt_termination)
          run_after_example
        },

        on_forced_release: ->() {
          run_callbacks(:forced_release)
          run_after_example
        },

        on_race_condition: ->() {
          run_callbacks(:race_condition)
        }
      })
    end

    # Bind the Agent to a websocket to start a testing session.
    #
    # @param [Websocket] socket
    # @param [Object] actor
    #        An instance of an object that will be receiving the RPC calls. Any
    #        `eval` RPCs will be evaluated in this object's context. If you're
    #        using Tubesock and hijacking a Rails controller, you can pass the
    #        controller itself as an actor, then you also have access to
    #        ApplicationController methods and helpers as RPCs.
    #
    # @return [NilClass]
    def bind(socket, actor)
      @mutex.lock(socket: socket, timeout: grace_timeout) do
        executor = Executor.new(actor: actor, socket: socket, serializer: @serializer)
        executor.run_before_example = method(:run_before_example)
        executor.run_after_example = method(:run_after_example)
        executor.run_around_command = method(:run_around_command)

        socket.onopen do
          puts "Happybara: client connected.".green
        end

        socket.onmessage do |payload|
          executor.handle_message(payload)
        end

        socket.onclose do
          puts "Happybara: client disconnected.".green
        end
      end

      nil
    end

    def on_forced_release(&callback)
      on(:forced_release, &callback)
    end

    def on_abrupt_termination(&callback)
      on(:abrupt_termination, &callback)
    end

    def on_race_condition(&callback)
      on(:race_condition, &callback)
    end

    private

    def run_before_example
      run_callbacks(:before_each)
    end

    def run_after_example
      run_callbacks(:after_each)
      @mutex.release
    end

    def run_around_command(message, &block)
      # TODO: support nested procs.. ?
      callback = callbacks[:around_command] && callbacks[:around_command].first

      if callback
        callback.call(message, block)
      else
        block.call
      end
    end
  end
end
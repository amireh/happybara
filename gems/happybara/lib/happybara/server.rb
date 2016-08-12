# require 'websocket_driver'
# require 'websocket'
# require 'websocket-eventmachine-server'
require 'websocket/driver'
require 'eventmachine'
require_relative './agent'
require_relative './server_configurator'

module Happybara
  class WebsocketAdapter
    def initialize(driver)
      @driver = driver
    end

    def onmessage(&block)
      @driver.on :message do |e|
        block[e.data]
      end
    end

    def send(text, *)
      @driver.text(text)
    end
  end

  module Connection
    def initialize(ctx)
      @agent = ctx[:agent]
      @configurator = ctx[:configurator]
      @driver = WebSocket::Driver.server(self)

      @driver.on :connect, -> (event) do
        @configurator.invoke(:before_each)
        @agent.bind(WebsocketAdapter.new(@driver))
        @driver.start
      end

      # @driver.on :message, -> (e) { @driver.text(e.data) }
      @driver.on :close, -> (e) do
        close_connection_after_writing
        @configurator.invoke(:after_each)
      end
    end

    def receive_data(data)
      @driver.parse(data)
    end

    def write(data)
      send_data(data)
    end
  end

  class Server
    def initialize()
      @configurator = ServerConfigurator.new(self)
    end

    def start(host: '127.0.0.1', port: 11142, &block)
      abort("The Rails environment is not running in test mode!") unless Rails.env.test?
      agent_klass = @configurator.agent || Agent
      agent = agent_klass.new(executor: @configurator.executor.try(:new))


      EM.run do
        @signature = EventMachine.start_server(host, port.to_i, Connection, {
          agent: agent,
          configurator: @configurator
        })

        @configurator.invoke(:before_all)

        # @signature = WebSocket::EventMachine::Server.start(host: host, port: port) do |ws|
        #   block[ws] if block.present?
        #   agent.bind(ws)

        #   ws.onopen do
        #     @configurator.invoke(:before_each, ws)
        #   end

        #   ws.onclose do
        #     @configurator.invoke(:after_each, ws)
        #   end
        # end
      end
    end

    def stop
      if @signature
        EventMachine.stop_server(@signature)
        @signature = nil
      end
    end

    def configure(&block)
      @configurator.instance_exec(@configurator, &block)
    end
  end
end
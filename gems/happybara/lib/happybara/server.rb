require 'websocket'
require 'websocket-eventmachine-server'
require 'database_cleaner'

require_relative './agent'
require_relative './server_configurator'

module Happybara
  class Server
    def initialize()
      @configurator = ServerConfigurator.new(self)
    end

    def start(host: '127.0.0.1', port: 11142, &block)
      abort("The Rails environment is not running in test mode!") unless Rails.env.test?
      agent = Agent.new(executor: @configurator.executor.try(:new))

      EM.run do
        WebSocket::EventMachine::Server.start(host: host, port: port) do |ws|
          @configurator.invoke(:before_all)

          at_exit do
            @configurator.invoke(:after_all)
          end

          block[ws] if block.present?
          agent.bind(ws)

          ws.onopen do
            @configurator.invoke(:before_each, ws)
          end

          ws.onclose do
            @configurator.invoke(:after_each, ws)
          end
        end
      end
    end

    def configure(&block)
      @configurator.instance_exec(@configurator, &block)
    end
  end
end
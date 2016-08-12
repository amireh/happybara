# require 'database_cleaner'
require_relative './serializer'

module Happybara
  class Agent
    def initialize(executor: Executor.new, serializer: Serializer.new)
      @executor = executor
      @serializer = serializer
    end

    def bind(socket)
      socket.onmessage do |payload, type|
        handle_message(socket, payload, type)
      end
    end

    private

    def handle_message(socket, payload, payload_type)
      puts "Received message: (#{payload_type}) #{payload}"

      message = @serializer.deserialize payload
      respond = ->(type, data) {
        socket.send({
          id: message['id'],
          type: type,
          data: data
        }.to_json, { type: payload_type })
      }

      begin
        case message['type']
        when 'RPC'
          handle_rpc(message, &respond)
        when 'EVAL'
          handle_eval(message, &respond)
        else
          fail "unknown message type #{message['type']}"
        end
      rescue StandardError => e
        puts "#{'=' * 80}\nHandler error!\n#{'-' * 80}"
        puts e.message
        puts e.backtrace

        respond['error', { details: e.message, backtrace: e.backtrace }]
      end
    end

    def handle_rpc(message, &respond)
      method_name = message['data']['procedure']
      method_args = message['data']['payload'] || {}
      method_opts = message['data']['options'] || {}

      if @executor.respond_to?(method_name)
        rc = within_tenant(method_opts['tenant']) do
          @executor.send(message['data']['procedure'], **method_args.symbolize_keys)
        end

        respond['RPC_RESPONSE', @serializer.serialize(rc)]
      else
        respond['error', { details: "unknown RPC #{method_name}" }]
      end
    end

    def handle_eval(message, &respond)
      string = message['data']['string']
      options = message['data']['options'] || {}

      within_tenant(options['tenant']) do
        begin
          rc = eval(string)
          respond['EVAL_RESPONSE', @serializer.serialize(rc)]
        rescue StandardError => e
          respond['error', { details: e.message }]
        end
      end

    end

    def within_tenant(tenant, &block)
      if tenant.blank?
        yield
      else
        Account.find_by(database: tenant).within &block
      end
    end
  end
end
module Happybara
  class Executor
    attr_accessor :run_before_example, :run_after_example, :run_around_command

    def initialize(actor:, socket:, serializer:)
      @actor = actor
      @socket = socket
      @serializer = serializer
      @registry = Registry.new
    end

    def handle_message(payload)
      message = @serializer.deserialize payload
      respond = method(:respond_to_message).curry[message['id']]

      case message['type']
      when 'SETUP'
        handle_setup(message, &respond)
      when 'RPC'
        handle_rpc(message, &respond)
      when 'EVAL'
        handle_eval(message, &respond)
      when 'QUERY'
        handle_query(message, &respond)
      when 'REFLECT'
        handle_reflect(message, &respond)
      when 'TEARDOWN'
        handle_teardown(message, &respond)
      else
        fail "unknown message type #{message['type']}"
      end
    rescue StandardError => e
      puts "#{'=' * 80}\nHandler error!\n#{'-' * 80}"
      puts e.message
      puts e.backtrace

      respond['error', { details: e.message, backtrace: e.backtrace }]
    end

    private

    def respond_to_message(message_id, type, data)
      @socket.send_data({
        id: message_id,
        type: type,
        data: data
      }.to_json)
    end

    def handle_setup(message, &respond)
      run_before_example[]

      respond['SETUP_RESPONSE', @serializer.serialize_value(true)]
    end

    def handle_query(message, &respond)
      @registry.open!(message['data']['klass_name'])

      klass = message['data']['klass_name'].constantize
      klass.public_instance_methods(true)
        .sort
        .map(&:to_s)
        .reject { |s| s[0] =~ /[\W|_]/ }
        .tap do |visible_instance_methods|
          respond['QUERY_RESPONSE', @serializer.serialize({
            instance_methods: visible_instance_methods
          })]
        end
    end

    def handle_rpc(message, &respond)
      method_name = message['data']['procedure']
      method_args = message['data']['payload'] || {}
      method_opts = message['data']['options'] || {}

      fail "Unknown RPC #{method_name}" unless @actor.respond_to?(method_name)

      result = around_command(message) do
        @actor.send(message['data']['procedure'], **method_args.symbolize_keys)
      end

      @registry << result

      respond['RPC_RESPONSE', @serializer.serialize_value(result)]
    end

    def handle_eval(message, &respond)
      string = message['data']['string']
      options = message['data']['options'] || {}

      around_command(message) do
        result = @actor.instance_eval { eval(string) }
        @registry << result
        respond['EVAL_RESPONSE', @serializer.serialize_value(result)]
      end
    end

    def handle_reflect(message, &respond)
      object_id = message['data']['object_id']
      klass_name = message['data']['klass_name']
      method_name = message['data']['method']
      method_args = message['data']['arguments']
      method_opts = message['data']['options'] || {}

      ref = resolve_reference(message['data'])

      fail "Object #{object_id} of type #{klass_name} could not be reflected" if ref.nil?

      rc = around_command(message) do
        ref.send(method_name, *method_args)
      end

      @registry << rc

      respond['REFLECT_RESPONSE', @serializer.serialize_value(rc)]
    end

    def handle_teardown(message, &respond)
      @registry.release!
      run_after_example[]

      respond['TEARDOWN_RESPONSE', @serializer.serialize_value(true)]
    end

    def around_command(message, &block)
      run_around_command[message['data'], &block]
    end

    def resolve_reference(descriptor)
      @registry[descriptor['object_id']]
    end
  end
end
module Happybara
  class ServerConfigurator
    attr_accessor :executor

    def initialize(server)
      @server = server
      @suite_configuration_blocks = {
        before_all: [],
        before_each: [],
        after_each: [],
        after_all: [],
      }
    end

    def before(suite_scope, &block)
      case suite_scope
      when :each
        @suite_configuration_blocks[:before_each] << block
      when :all
        @suite_configuration_blocks[:before_all] << block
      else
        fail "Unsupported before() scope '#{suite_scope}'"
      end
    end

    def after(suite_scope, &block)
      case suite_scope
      when :each
        @suite_configuration_blocks[:after_each] << block
      when :all
        @suite_configuration_blocks[:after_all] << block
      else
        fail "Unsupported before() scope '#{suite_scope}'"
      end
    end

    def invoke(stage, *args)
      case stage
      when :before_all, :after_all, :before_each, :after_each
        @suite_configuration_blocks[stage].each do |callback|
          callback.call(*args)
        end
      else
        fail "InternalError: unknown stage '#{stage}' to invoke!"
      end
    end
  end
end
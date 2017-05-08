module Happybara
  module Callbacks
    def before(stage, &callback)
      case stage.to_sym
      when :each
        on(:before_each, &callback)
      when :all
        Rails.configuration.after_initialize(&callback)
      else
        fail "Unknown :before stage '#{stage}'"
      end
    end

    def after(stage, &callback)
      case stage.to_sym
      when :each
        on(:after_each, &callback)
      when :all
        at_exit(&callback)
      else
        fail "Unknown :after stage '#{stage}'"
      end
    end

    def around(stage, &callback)
      case stage.to_sym
      when :command
        on(:around_command, &callback)
      else
        fail "Unknown :around stage '#{stage}'"
      end
    end

    def on(event, &handler)
      callbacks[event.to_sym] ||= []
      callbacks[event.to_sym] << handler
    end

    protected

    def callbacks
      @callbacks ||= {}
    end

    def run_callbacks(event)
      callbacks.fetch(event).each do |callback|
        callback.call
      end
    end
  end
end

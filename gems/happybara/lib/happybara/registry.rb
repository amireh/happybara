module Happybara
  class Registry
    def initialize()
      @reflections = {}
    end

    def open!(klass_name)
      @reflections[klass_name.to_s] = {}
    end

    def <<(object)
      self.tap do
        klass_name = object.class.name.to_s

        if @reflections[klass_name]
          @reflections[klass_name][object.object_id] = object
        end
      end
    end

    def [](object_id)
      ObjectSpace._id2ref(object_id) || nil
    end

    def release!()
      @reflections.clear
    end
  end
end
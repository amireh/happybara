module Happybara
  class Serializer
    def serialize(result)
      result.as_json
    end

    def serialize_value(result)
      {
        klass: result.class.name,
        object_id: result.object_id,
        value: result.as_json
      }
    end

    def serialize_reference(ref)
      {
        klass: ref.class.name,
        object_id: ref.object_id,
      }
    end

    def deserialize(payload)
      JSON.load(payload, ->(datum) {
        case datum
        when Hash
          datum.each_pair do |key, value|
            if value.is_a?(Hash) && value['$$ref'] == true && value['$$object_id']
              datum[key] = ObjectSpace._id2ref(value['$$object_id']) || nil
            end
          end

          datum
        else
          datum
        end
      })
    end
  end
end
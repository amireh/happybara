module Happybara
  class Serializer
    def serialize(result)
      result.as_json
    end

    def deserialize(payload)
      JSON.parse(payload)
    end
  end
end
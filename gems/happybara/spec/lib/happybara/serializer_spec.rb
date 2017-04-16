require 'fileutils'
require 'spec_helper'

describe Happybara::Serializer do
  describe '#deserialize' do
    it 'resolves references' do
      some_object = Object.new

      result = subject.deserialize({
        foo: {
          '$$ref': true,
          '$$object_id': some_object.object_id
        }
      }.to_json)

      expect(result['foo']).to be(some_object)
    end
  end
end
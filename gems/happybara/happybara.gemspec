# coding: utf-8

require_relative './lib/happybara/version'

Gem::Specification.new do |spec|
  spec.name          = "happybara"
  spec.version       = Happybara::VERSION
  spec.authors       = ["Ahmad Amireh"]
  spec.email         = ["ahmad@amireh.net"]
  spec.summary       = "Perform Rails RPCs inside JavaScript for test."

  spec.files         = Dir.glob("{lib,spec}/**/*")
  spec.test_files    = spec.files.grep(%r{^(spec)/})
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency 'rails', [ '>= 5', '< 6' ]
  spec.add_development_dependency 'rspec', '~> 3.5.0'
end
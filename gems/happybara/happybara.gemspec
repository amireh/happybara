# coding: utf-8

require_relative './lib/happybara/version'

Gem::Specification.new do |spec|
  spec.name          = "happybara"
  spec.version       = Happybara::VERSION
  spec.authors       = ["Ahmad Amireh"]
  spec.email         = ["ahmad@instructure.com"]
  spec.summary       = "Run Rails code within tests written in JavaScript."

  spec.files         = Dir.glob("{lib,spec}/**/*")
  spec.test_files    = spec.files.grep(%r{^(spec)/})
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency 'rails', [ '>= 4', '< 6' ]
  # spec.add_runtime_dependency 'database_cleaner', '~> 1.5.3'
  spec.add_runtime_dependency 'websocket-driver'
  # spec.add_runtime_dependency 'websocket', '~> 1.2.3'
  # spec.add_runtime_dependency 'websocket-eventmachine-server', '~> 1.0.1'
  spec.add_development_dependency 'rake', '~> 10.0'
  spec.add_development_dependency 'rspec', '~> 3.5.0'
  spec.add_development_dependency 'eventmachine'
end
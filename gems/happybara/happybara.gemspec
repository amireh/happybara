# coding: utf-8

require_relative './lib/happybara/version'

Gem::Specification.new do |spec|
  spec.name          = "happybara"
  spec.version       = Happybara::VERSION
  spec.authors       = ["Ahmad Amireh"]
  spec.email         = ["ahmad@amireh.net"]
  spec.summary       = "An integration test server using Websockets."
  spec.homepage      = "https://github.com/amireh/happybara"
  spec.license       = "BSD-3"
  spec.description   = <<-EOF
Happybara is an integration testing platform providing a webserver in Ruby that
accepts connections over a websocket where test clients can dispatch RPCs to
Ruby from a different language like JavaScript.
EOF

  spec.files         = Dir.glob("{lib,spec}/**/*")
  spec.test_files    = spec.files.grep(%r{^(spec)/})
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency 'rails', [ '>= 5', '< 6' ]
  spec.add_runtime_dependency 'colorize'
  spec.add_development_dependency 'rspec', '~> 3.5'
end
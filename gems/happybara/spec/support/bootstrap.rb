# This dance is necessary to subvert railtie from resolving get_smart's Rails
# application as the "Rails.application"; we really only need a dummy
# application that can host some routes, and if this gem was sourced elsewhere
# we could just define such an application directly but since it's sourced
# within get_smart, railtie will resolve the root `config.ru` and cause sadness.
#
# Be happy, unless you're upgrading Rails and this gets broken. :-)

require 'rails/application'
require 'rails/configuration'
require 'rails/railtie'
require 'active_support'

module Rails
  class << self
    attr_writer :app_class, :application
  end
end

module Happybara
  class TestApplication < ::Rails::Application
    class << self
      def find_root(*)
        Pathname.new File.realpath File.expand_path(File.dirname(__FILE__))
      end
    end
  end
end

require 'rails'
require 'action_view'
require 'action_controller'

Happybara::TestApplication.configure do
  config.eager_load = ENV['COVERAGE'] != '1'
end

Happybara::TestApplication.initialize!

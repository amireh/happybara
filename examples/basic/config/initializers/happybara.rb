if ENV['HAPPYBARA'] == '1'
  require 'happybara'

  server_thread = Thread.new do
    server = Happybara::Server.new
    server.start
  end

  at_exit do
    server_thread.kill
    server_thread.join
    server_thread = nil
  end
end
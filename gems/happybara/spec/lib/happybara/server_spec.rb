require 'fileutils'
require 'spec_helper'

describe Happybara::Server do
  it 'is constructible' do
  end

  it 'can be started and stopped' do
    allow(DatabaseCleaner).to receive(:strategy=)
    allow(DatabaseCleaner).to receive(:start)
    allow(DatabaseCleaner).to receive(:clean)

    timeout(3) do
      started = false

      EM.run do
        EM.add_timer 2 do
          EM.stop
          expect(started).to be_truthy
        end

        subject.start do |ws|
          started = true
          puts "HELLO!"
          # EM.stop
        end
      end
    end
  end

  it 'can be configured' do
    configured = false

    subject.configure do
      configured = true
    end

    expect(configured).to be_truthy
  end

  def timeout(timeout = 1)
    Timeout::timeout(timeout) do
      EM.run do
        EM.epoll
        yield
      end
    end
  rescue Timeout::Error
    fail 'EventMachine was not stopped before the timeout expired'
  end
end
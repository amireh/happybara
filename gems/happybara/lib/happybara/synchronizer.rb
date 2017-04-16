module Happybara
  class Synchronizer
    def initialize(
      on_forced_release:,
      on_abrupt_termination:,
      on_race_condition: nil
    )
      @on_forced_release = on_forced_release || ->() {}
      @on_abrupt_termination = on_abrupt_termination || ->() {}
      @on_race_condition = on_race_condition || ->() {}
      @mutex = Mutex.new
    end

    def lock(socket:, timeout: 5.0, frequency: 0.1, &block)
      socket.onopen do
        acquire!(timeout: timeout, frequency: frequency, &block)
      end

      socket.onclose do
        @on_abrupt_termination[] if @mutex.owned? && @mutex.locked?
      end
    end

    def release
      @mutex.unlock
    end

    private

    def acquire!(timeout:, frequency:, &block)
      if @mutex.locked? && !@mutex.owned?
        fail "
          The Happybara agent is being accessed by multiple threads. This
          mode of operation is not currently supported.

          (This most likely indicates that you have multiple client runners
          communicating with this Rails server concurrently.)
        "
      elsif @mutex.locked?
        @on_race_condition[]

        begin
          Timer.new(frequency: frequency, timeout: timeout)
            .until { vacant? }
            .otherwise { @on_forced_release[] }
            .start!
        rescue TimeoutError
          @on_forced_release[]
        end
      end

      @mutex.lock

      yield
    end

    def vacant?
      !@mutex.locked?
    end

    class Timer
      def initialize(frequency:, timeout:)
        @frequency = frequency
        @timeout = timeout
        @until = nil
        @otherwise = nil
      end

      def until(&block)
        @until = block
      end

      def otherwise(&block)
        @otherwise = block
      end

      def start!
        elapsed = 0.0

        while !@until[]
          elapsed += frequency

          if elapsed < timeout
            sleep frequency
          elsif @otherwise
            @otherwise[]
          else
            raise TimeoutError.new
          end
        end
      end
    end
  end
end
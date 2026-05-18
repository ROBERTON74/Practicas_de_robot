#pragma once

struct Measurement {
  unsigned long timestamp;
  double height;
  double fan;
};

class Logger {
  private:
    int buffer_read = 0;
    int buffer_write = 0;
    static const int buffer_size = 50;
    Measurement buffer[buffer_size];

  public:
    void put(const Measurement *point);
    bool get(Measurement&);
    void log(unsigned long timestamp, double height, double voltage);
};


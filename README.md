# iotdb-iotql
IoTQL - an SQL-like language for the IoT

See [IoTQL.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL.pdf)
See [IoTQL-CREATE.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL-CREATE.pdf)

## Running

This isn't quite finished yet, but you can do

    $ node RunSamples --all

The samples are in <code>samples</code>. The Things it
runs against are in <code>samples/things</code>. 
How that's structured should be fairly obvious.

## Notes

to compile the grammar, you need to do this

    $ jison grammar.jison

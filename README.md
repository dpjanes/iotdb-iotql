# iotdb-iotql
IoTQL - an SQL-like language for the IoT

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" style="margin-left: 10px; "/>

# What is it?

IoTQL is an SQL-like language for the IoT. 
It allows you to query Things, change their state, and define actions to happen in the future.

Here's a few example queries - see below and the docs folder for a lot more:

	-- see everything
	SELECT id, state:*, meta:*;
	-- set the temperature in the basement
	SET state:temperature = 20°C WHERE meta:zone & "Basement";
	-- set the color of Hue lights
	SET state:color = "#FF9999" WHERE meta:model-id = "hue-light";
	

It's written to work with HomeStar / IOTDB but is flexible enough to plug into almost any projects that can present a simple [Transporter API](https://github.com/dpjanes/iotdb-transport).

# Command Line Version

IoTQL can be used as a command line tool. 
It will connect to your local [IOTDB / HomeStar](https://homestar.io/about/install) installation, sample data, or to IOTDB instances running on the web.

## Installation

	$ npm install -g iotql
	$ sudo install -g iotql ## if the line above doesn't work
	
## Usage
### With Sample Data

IoTQL ships with a (very small) data set for testing

	$ iotql --samples
	>>> SELECT id, meta:name;

### With IOTDB / HomeStar

Make sure you've [installed and set up HomeStar](https://homestar.io/about/install), and are in the proper folder - usually your home directory. Then just do:

	$ iotql 
	
### With Connect to sample REST / MQTT server

_Not implemented yet_

	$ iotql --things http://homestar.io:20000/api/things
	
### As JSON RPC server

IoTQL can act as a JSON-RPC server so it can be used from a web browser terminal server.

First, make sure you have JSON-RPC2 installed:

	$ npm install json-rpc2
	
Then run IoTQL as a JSON RPC server

	$ iotql --samples --rpc
	
Then try it from the browser (assuming you have the [GitHub IoTQL project](https://github.com/dpjanes/iotdb-iotql) available).

	$ open examples/jquery-terminal/index.html
	
Note that there's no security or anything, so this is purely for demonstration purposes.
	
# Library Version

## Installation
To embed IoTQL in your projects, do:

	$ npm install iotql

## Usage

See the [docs](./docs) folder for more documentation. There's also a ton of examples in [samples](./samples).

### In Node.JS
Here's how you use IoTQL in your project

	var iotql = require('iotql')
	var paramd = {};
	iotql.connect(paramd, function(error, db) {
		
	);
	
### With Transporter

_Not implemented yet_

	var transporter = ...;
	transport.list({
		query: "state:sensor.temperature°C > 25",
	}, function(d) {
		if (d.query) {
		}
	});
	
Transporters do not need to support queries. 
Transporters that _do_ support query will always set <code>d.query</code>
to <code>true</code> when a <code>query</code> statement is used.

# Syntax / Examples

## Get Everything

	SELECT id, meta:*, meta:*;

## Turn on everything

	SET state:on = true
	
## Sight lights to yellow

	SET state:color = "yellow" WHERE meta:facet & facets.lighting;
	
## Set the temperature in the basement - in Celsius

	SET state:temperature = 20°C WHERE meta:zone & "Basement"

## What's the temperature - in Fahrenheit

	SELECT units(state:sensor.temperature, °F)
	
or (more flexible, but unwieldy)

	SELECT units(state:sensor.temperature,
	             units:temperature.imperial.fahrenheit)
	
# Development
## Running

This isn't quite finished yet, but you can do

    $ node RunSamples --all

The samples are in <code>samples</code>. The Things it
runs against are in <code>samples/things</code>. 
How that's structured should be fairly obvious.

## Compile the Grammar

to compile the grammar, you need to do this

    $ jison grammar.jison


## More Documentation
See [IoTQL.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL.pdf)
See [IoTQL-CREATE.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL-CREATE.pdf)

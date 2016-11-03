# iotdb-iotql
IoTQL - an SQL-like language for the IoT.

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" style="margin-left: 10px; "/>

# About

Note that we're likely going to depreciate all of this except 
for the CREATE MODEL call. Why? Because it's starting
to look like [Apache Drill](https://drill.apache.org/) may be a better solution.

## What is it?

IoTQL is an SQL-like language for the IoT. 
It allows you to query Things, change their state, and define actions to happen in the future.
It also allows you to write Models for Things.

Here's a few example queries - see below and the docs folder for a lot more:

	-- see everything
	SELECT id, state:*, meta:*;
	-- set the temperature in the basement
	SET state:temperature = 20°C WHERE meta:zone & "Basement";
	-- set the color of Hue lights
	SET state:color = "#FF9999" WHERE meta:model-id = "hue-light";
	

It's written to work with HomeStar / IOTDB but is flexible enough to plug into almost any projects that can present a simple [Transporter API](https://github.com/dpjanes/iotdb-transport).

# Installation 

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)
* [Read about installing Home☆Star](https://github.com/dpjanes/node-iotdb/blob/master/docs/homestar.md) 

Then:

    $ npm install -g homestar    ## may require sudo
    $ homestar install iotql 

# Use

Basic pattern:

	$ homestar iotql

## With Sample Data

IoTQL ships with a (very small) data set for testing

	$ homestar iotql --samples
	>>> SELECT id, meta:*;

## With IOTDB / HomeStar

Make sure you've [installed and set up HomeStar](https://homestar.io/about/install), and are in the proper folder - usually your home directory. Then just do:

	$ homestar iotql 
	
## Models

All Models in IOTDB are now written using IoTQL. These 
Models are compiled to JSON-LD for actual usage. You can
see examples here:

	
# Library Version

## Installation
To embed IoTQL in your projects, do:

	$ homestar install iotql

You can use <code>npm</code> instead of <code>homestar</code> if you're not
using [HomeStar](https://homestar.io/about).

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
## Test Cases
### Running

This isn't quite finished yet, but you can do

    $ node tools/RunSamples --all

The samples are in <code>samples</code>. The Things it
runs against are in <code>samples/things</code>. 
How that's structured should be fairly obvious.

### Writing expected results

    $ node tools/RunSamples --all --write

### Testing against expected results

    $ node tools/RunSamples --all --test

This can also be done by

    $ npm test

## Compile the Grammar

to compile the grammar, you need to do this

    $ ( cd ./grammar; jison grammar.jison )

## More Documentation

* [IoTQL.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL.pdf)
* [IoTQL-CREATE.pdf](https://github.com/dpjanes/iotdb-iotql/blob/master/docs/IoTQL-CREATE.pdf)

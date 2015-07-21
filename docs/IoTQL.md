# SQL-like Query / Control for the Internet of Things

Here's a sketch of some ideas for an IoT control language, similar to SQL, built on the IOTDB semantic definitions

## Conventions

### id
<code>id</code> is always the thing-id of a Thing

### Bands
Band documentation [here](https://homestar.io/about/bands).
There are multiple sets of data associated with any one Thing.

* meta: the metadata
* ostate: the "output state" - what we want a Thing to do, what we want it to transition to
* istate: the "input state" - the actual state of a Thing
* state: when reading, the istate; when writing, the ostate: This is usually, except for certain edge cases, the right thing to do.

### Facets

These come from here: https://iotdb.org/pub/iot-facets

### Units

These come from here: https://iotdb.org/pub/iot-units

### Operators

Assume Pythonic Truth: i.e. false, 0, [], {} and NULL are all False; everything else is True.

This takes a very "semantic web" view toward lists. Some items can have multiple values, sometimes they are a single value. We have to deal with this gracefully.

* LIST(y): if y is a list, y; otherwise [ y ]
* x IN y: true if x is an element of LIST(y)
* x & y: the intersection of LIST(x) and LIST(y)
* x | y: the union of LIST(x) and LIST(y)

## Lists and Dictionaries

JSONish. Not sure what this means yet.

## Examples
### Turn on everything

	SET
		state:on = true
		
That's probably a little extreme for most people!

Mappings:

* <code>state:on</code> → OSTATE(iot-attribute:on)


### Turn on "Desktop Lamp"

	SET
		state:on = true
	WHERE
		meta:name = "Desktop Lamp"

Mappings:

* <code>state:on</code> → OSTATE(iot-attribute:on) 
* <code>meta:name</code> → META(schema:name)

The IOTQL knows that certain words gets mapped into different namespaces.


### Set all lights in the basement to half-bright

	SET
		state:brightness = 50%
	WHERE
		meta:zone & "Basement"
	AND
		meta:facet & facets:lighting
		
Originally we had "=" instead of "&", but it's not really the operator we want to do. Theoretically there's a list on both sides. The "&" operator is to test for intersection of lists. Items that are not lists are cast to lists. 
		
Mappings:

* <code>state:brightness</code> → OSTATE(iot-attribute:brightness)
* <code>meta:zone</code> → META(iot:zone)
* <code>meta:facet</code> → META(iot:facet)
* <code>facets:lighting</code> → iot-facet:lighting
* % → a value between 0 and 100, equivalent to UNITS(#,iot-unit:math.fraction.percent)

### Get the temperature

	SELECT
		state:sensor.temperature
	
as a variant

	SELECT
		state:sensor.temperature AS temperature
		
Mappings:

* <code>sensor.temperature</code> → ISTATE(iot-attribute:sensor.temperature)

Note - what do we do with Things that don't have the attribute <code>sensor.temperature</code>? If a row is all NULL values, the row should be discarded from the results.

### Get the temperature in Celsius, only from HVAC equipment

	SELECT
		UNITS(state:sensor.temperature,units:temperature.metric.celsius)
	WHERE
		meta:facet & facets:climate
		
Mappings:

* <code>state:sensor.temperature</code> → OSTATE(iot-attribute:sensor.temperature)
* <code>units:temperature.metric.celsius</code> → iot-attribute:temperature.metric.celsius
* <code>facets:climate</code> → iot-facet:climate
* <code>meta:facet</code> → iot:facet

### Set the temperature in the basement to 68F

	SET
		state:temperature = UNITS(68,units:temperature.imperial.fahrenheit)
	WHERE
		meta:zone & "Basement"
	AND 
		meta:facet & [ climate.heating, climate.cooling ]
		
* <code>sensor.temperature</code> → ISTATE(iot-attribute:sensor.temperature)
* <code>zone</code> → META(iot:zone)
* <code>facet</code> → META(iot:facet)
* <code>climate.heating</code> → iot-facet:climate.heating
* <code>climate.cooling</code> → iot-facet:climate.cooling

Note JSON list structure!

### Get the name of everything

	SELECT
		id, meta:name
		
### Change the name of something

	SET
		meta:name = "Desktop Lamp"
	WHERE
		meta:name = "Downstairs Lamp"
		
### Get everything that is on

	SELECT
		id, meta:name
	WHERE
		state:on = true
		
Note that since we accept Pythonic type trues, so we could also do

	SELECT
		id, meta:name
	WHERE
		state:on
					
	
## Select everything that is in the Interstitial State

Interstitial meaning ostate has a value

	SELECT
		meta:name
	WHERE
		ostate:*
		









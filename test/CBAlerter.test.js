'use strict';

const CBAlerter = require('./../src/CBAlerter');
const StandardError = require('@unplgtc/standarderror');
const request = require('request');

var builder = function(level, key, data, options, err) {
	return {
		url: 'some_url',
		body: {
			key: key,
			data: data
		},
		json: true
	}
}
var anotherBuilder = function(level, key, data, options, err) {
	return {
		url: 'some_other_url',
		body: {
			key: key,
			data: data
		},
		json: true
	}
}
var webhookName = 'some_webhook_name';
var mockedArgs = ['DEBUG', 'test_key', {text: 'testing'}, {alert: true}];
var moreMockedArgs = ['ERROR', 'another_test_key', {text: 'testing again'}, {alert: true, webhook: webhookName}, StandardError[500]];

test('Can\'t trigger a default alert before a default webhook has been added', async() => {
	// Execute
	var res = CBAlerter.alert(...mockedArgs);

	// Test
	expect(res).toBe(StandardError.CBAlerter_404);
});

test('Can add a default webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(builder);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via the default webhook', async() => {
	// Setup
	request.post = jest.fn();

	// Execute
	var sent = CBAlerter.alert(...mockedArgs);

	// Test
	expect(sent).toBe(true);
	expect(request.post).toHaveBeenCalledWith(builder(...mockedArgs), expect.any(Function));
});

test('Can\'t add a second default webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(anotherBuilder);

	// Test
	expect(success).toBe(StandardError.CBAlerter_409);
});

test('Can add a named webhook', async() => {
	// Execute
	var success = CBAlerter.addWebhook(anotherBuilder, webhookName);

	// Test
	expect(success).toBe(true);
});

test('Can send an alert via a named webhook', async() => {
	// Setup
	request.post = jest.fn();

	// Execute
	var sent = CBAlerter.alert(...moreMockedArgs);

	// Test
	expect(sent).toBe(true);
	expect(request.post).toHaveBeenCalledWith(anotherBuilder(...moreMockedArgs), expect.any(Function));
});

test('Can\'t add a named webhook with an existing name', async() => {
	// Execute
	var success = CBAlerter.addWebhook(builder, webhookName);

	// Test
	expect(success).toBe(StandardError.CBAlerter_409);
});

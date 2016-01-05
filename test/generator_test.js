function delay(time, callback) {
	setTimeout(function() {
		callback("Slept for " + time);
	}, time);
};

function* myDelayedMessages(resume) {
	console.log(yield delay(1000, resume));
	console.log(yield delay(1200, resume));
};

function run(generatorFunction) {
	var generatorItr = generatorFunction(resume);

	function resume(callbackValue) {
		generatorItr.next(callbackValue);
	}
	generatorItr.next()
};

run(myDelayedMessages)
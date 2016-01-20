p = new Promise(function(resolve, reject) {
	setTimeout(function() {
		console.log(resolve("QAQ", "QwQ"))
	}, 1000)
}).then(function() {
	console.log(arguments)
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve("QwQ")
		}, 1000)
	})
}).then(function() {
	console.log(arguments)
})
require("../lib/global");
setTimeout(process.exit, 100);

console.log(
	["resolveVerifyApplyByUserId",
		"rejectVerifyApplyByUserId",
		"withdrawVerifyResultByUserId",
	].map(s => s.underlize()).join("\n")
)
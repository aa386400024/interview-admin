/**
 * URL重写
 */
module.exports = {
	"rule": {
		// 示例1：https://xxx.bspapp.com/http/router/aaa 指向云函数 template/db_api/pub/select
		"^aaa$": "template/db_api/pub/select",
		// 示例2：https://xxx.bspapp.com/http/router/findById/001 指向云函数 template/db_api/pub/findById?_id=001
		"^findById/(.+)": "template/db_api/pub/findById?_id=$1"
	},
	"config": {
		// 当设置为true时，只有符合url重写规则内的云函数才可以被url化访问。
		"accessOnlyInRule": false
	}
};

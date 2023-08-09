<template>
	<view class="page-body">
		<!-- 页面内容开始 -->
		<!-- 职位弹窗 -->
		<vk-data-dialog 
		    v-model="isPositionsDialogVisible" 
		    title="职位列表" 
		    width="60%">
		    <vk-data-table
		        :data="selectedPositions"
		        :columns="positionTable.columns">
		    </vk-data-table>
		</vk-data-dialog>

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button 
					type="success" 
					size="small" 
					icon="el-icon-circle-plus-outline" 
					@click="addBtn"
				>添加</el-button>
				<!-- 批量操作 -->
				<el-dropdown 
					v-if="table1.multipleSelection" 
					:split-button="false" 
					trigger="click" 
					@command="batchBtn"
				>
					<el-button 
						type="danger" 
						size="small" 
						style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0"
					>
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量操作1</el-dropdown-item>
						<el-dropdown-item :command="2">批量操作2</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table
			ref="table1"
			:action="table1.action" 
			:columns="table1.columns" 
			:query-form-param="queryForm1"
			:right-btns="['detail_auto','update','delete']"
			:default-sort="{ name:'position_id', type:'asc' }"
			:selection="true" 
			:row-no="true" 
			:pagination="true"
			@update="updateBtn" 
			@delete="deleteBtn" 
			@current-change="currentChange"
			@selection-change="selectionChange"
		></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog 
			v-model="form1.props.show" 
			:title="form1.props.title" 
			width="800px" 
			mode="form"
			:close-on-click-modal="false"
		>
			<vk-data-form 
				ref="form1" 
				v-model="form1.data"
				:rules="form1.props.rules" 
				:action="form1.props.action"
				:form-type="form1.props.formType" 
				:columns='form1.props.columns' 
				:loading.sync="form1.props.loading"
				:label-width="100" 
				width="100%" 
				label-position="right" 
				size="medium" 
				:disabled="false" 
				@success="formSuccess"
				@cancel="onCancel"
			></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	var that; // 当前页面对象
	var vk = uni.vk; // vk实例
	var originalForms = {}; // 表单初始化数据

	export default {
		data() {
			// 页面数据变量
			return {
				selectedPositions: [], // 用于存储当前选中的职位列表
				isPositionsDialogVisible: false, // 控制职位对话框的显示/隐藏
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {},
				positionTable: {
					columns: [
						{
							key: "name",
							title: "职位名称",
							type: "text"
						},
						{
							key: "name_en",
							title: "职位英文名称",
							type: "text"
						},
						{
							key: "position_id",
							title: "职位ID",
							type: "text"
						},
						{
							key: "interviewed_count",
							title: "面试次数",
							type: "text"
						},
						{
							key: "requires_proficiency",
							title: "技能熟练度要求",
							type: "text",
							formatter: (val, row, column, index) => {
								const text = val ? '需要' : '不需要'
								return text;
							}
						},
						{
							key: "requires_skills",
							title: "技能要求",
							type: "text",
							formatter: (val, row, column, index) => {
								const text = val ? '需要' : '不需要'
								return text;
							}
						},
					]
				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/iv-positions-manager/sys/getList",
					// 表格字段显示规则
					columns: [{
							key: "_id",
							title: "id",
							type: "text",
							width: 200
						},
						{
							key: "name",
							title: "职位名称",
							type: "text",
							width: 120
						},
						{
							key: "name_en",
							title: "职位英文名称",
							type: "text",
							width: 120
						},
						{
							key: "position_id",
							title: "职位ID",
							type: "text",
							width: 120
						},
						{
							key: "industry_name",
							title: "行业名称",
							type: "text",
							formatter: (val, row, column, index) => {
								return row.industry ? row.industry.name : '未知'; // 从职位的industry属性中提取行业名称
							}
						},
						{
							key: "industry_id",
							title: "行业ID",
							type: "text",
						},
						{
							key: "description",
							title: "职位描述",
							type: "text",
							defaultValue: '未设置'
						},
						// {
						// 	key: "icon",
						// 	title: "职位图标",
						// 	type: "icon",
						// },
						{
							key: "interviewed_count",
							title: "面试次数",
							type: "text"
						},
						{
							key: "requires_proficiency",
							title: "技能熟练度要求",
							type: "text",
							formatter: (val, row, column, index) => {
								const text = val ? '需要' : '不需要'
								return text;
							}
						},
						{
							key: "requires_skills",
							title: "技能要求",
							type: "text",
							formatter: (val, row, column, index) => {
								const text = val ? '需要' : '不需要'
								return text;
							}
						},
					],
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: ""
				},
				// 表格相关结束 -----------------------------------------------------------
				
				// 表单相关开始 -----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
						// 查询表单数据源，可在此设置默认值
						formData: {},
						// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
						columns: [{
								key: "_id",
								title: "ID",
								type: "text",
								width: 140,
								mode: "="
							},
							{
								key: "name",
								title: "职位名称",
								type: "text",
								width: 140,
								mode: "%%"
							},
							{
								key: "description",
								title: "职位描述",
								type: "text",
								width: 140,
								mode: "%%"
							}
						]
					},
				
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						"name": "",
						"description": "",
						"name_en": "",
						"icon": "",
						"industry_id": "",
						"requires_proficiency": false,
						"requires_skills": false,
					},
					// 表单属性
					props: {
						// 表单提交地址
						action: "",
						// 表单字段显示规则
						columns: [{
							"key": "name",
							"title": "职位名称",
							"type": "text",
							"placeholder": "请输入职位名称",
							"showLabel": true
						}, {
							"key": "name_en",
							"title": "职位英文名称",
							"type": "text",
							"placeholder": "请输入职位英文名称",
							"showLabel": true
						}, {
							"key": "description",
							"title": "职位描述",
							"type": "textarea",
							"placeholder": "请输入职位描述",
							"showLabel": true,
							"autosize": {
								"minRows": 4,
								"maxRows": 4
							}
						}, {
							"key": "icon",
							"title": "职位图标",
							"type": "text",
							"placeholder": "请输入职位图标",
							"showLabel": true
						}, { 
							"action": "admin/iv-positions-manager/sys/getIndustriesList",
							"key": "industry_id",
							"title": "所属行业",
							"type": "remote-select",
							"placeholder": "请选择所属行业",
							"props": { list: "rows", value: "value", label: "label" },
							"showAll": true,
							"actionData": {
							    pageSize: 1000
							}
						}, {
							"key": "requires_proficiency",
							"title": "技能熟练度要求",
							"type": "switch",
							"showLabel": true
						}, {
							"key": "requires_skills",
							"title": "技能要求",
							"type": "switch",
							"showLabel": true
						}
						],
						// 表单验证规则
						rules: {
							"name": [{
								"required": true,
								"message": "职位名称不能为空",
								"trigger": "change"
							}],
							"name_en": [{
							    "required": true,
							    "message": "职位英文名称不能为空",
							    "trigger": "change"
							}],
							"icon": [{
							    "required": true,
							    "message": "职位图标不能为空",
							    "trigger": "change"
							}],
							"industry_id": [{
							    "required": true,
							    "message": "所属行业不能为空",
							    "trigger": "change"
							}],
							"description": [{
								"required": true,
								"message": "职位描述不能为空",
								"trigger": "change"
							}]
						},
						// 自定义表单类型，如：add 代表添加 update 代表修改，可以为空
						formType: "",
						// 是否显示表单的弹窗
						show: false,
						// 表单是否在请求中
						loading: false
					},
				},
				// 其他弹窗表单
				formDatas: {},
				// 表单相关结束 -----------------------------------------------------------
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			that = this;
			vk = that.vk;
			that.options = options;
			that.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {},
		// 函数
		methods: {
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(that.form1);
			},
			formSuccess() {
				console.log("表单提交了");
				this.form1.props.show = false;
				this.refresh();
			},
			onCancel() {
				console.log("关闭了");
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				vk.pubfn.resetForm(originalForms, that);
			},
			// 搜索
			search() {
				that.$refs.table1.search();
			},
			// 刷新
			refresh() {
				that.$refs.table1.refresh();
			},
			// 获取当前选中的行的数据
			getCurrentRow() {
				return that.$refs.table1.getCurrentRow();
			},
			// 监听 - 行的选中高亮事件
			currentChange(val) {
				that.table1.selectItem = val;
			},
			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				that.table1.multipleSelection = list;
			},
			// 显示添加页面
			addBtn() {
				that.resetForm();
				that.form1.props.action = 'admin/iv-positions-manager/sys/add';
				that.form1.props.formType = 'add';
				that.form1.props.title = '添加';
				that.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({ item }) {
				that.form1.props.action = 'admin/iv-positions-manager/sys/update';
				that.form1.props.formType = 'update';
				that.form1.props.title = '编辑';
				that.form1.props.show = true;
				that.form1.data = item;
			},
			// 删除按钮
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "admin/iv-positions-manager/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				switch (index) {
					case 1:
						vk.toast("批量操作按钮1");
						break;
					case 2:
						vk.toast("批量操作按钮2");
						break;
					default:
						break;
				}
			},
			showPositions(index) {
				this.selectedPositions = this.table1.columns[index].positions;
				this.isPositionsDialogVisible = true;
			}
		},
		// 监听属性
		watch: {},
		// 过滤器
		filters: {},
		// 计算属性
		computed: {}
	};
</script>

<style lang="scss" scoped>
    .page-body {}
    .el-upload__tip {
        line-height: 1.2;
    }
</style>
<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

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

		<!-- 视频播放器 -->
		<view class="video-container" v-if="showVideoPlayer">
			<video ref="videoPlayer" :src="videoSrc" controls></video>
			<view class="close-btn" @click="closeVideoPlayer">X</view>
		</view>
		
		<!-- 表格组件开始 -->
		<vk-data-table 
			ref="table1" 
			:action="table1.action" 
			:columns="table1.columns" 
			:query-form-param="queryForm1"
			:right-btns="['detail_auto','update','delete']" 
			:selection="true" 
			:row-no="true" 
			:pagination="true"
			@update="updateBtn" 
			@delete="deleteBtn" 
			@current-change="currentChange"
			@selection-change="selectionChange"
		>
			<template v-slot:video_url="{ row }">
				<a href="javascript:;" @click="playVideo(row.video_url)">查看视频</a>
			</template>
		</vk-data-table>
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
				showVideoPlayer: false,
				videoSrc: '',
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/iv-questions-manager/sys/getList",
					// 表格字段显示规则
					columns: [{
							key: "_id",
							title: "id",
							type: "text",
							width: 100
						},
						{
							key: "question_text",
							title: "面试问题",
							type: "text",
							width: 200
						},
						{
							key: "industry_name",
							title: "行业",
							type: "text",
							defaultValue: '未设置'
						},
						{
							key: "position_name",
							title: "职位",
							type: "text",
							defaultValue: '未设置'
						},
						{
							key: "level",
							title: "级别",
							type: "text",
							defaultValue: '未设置'
						},
						{
						  key: "skills",
						  title: "技能",
						  type: "html",
						  width: 150,
						  formatter: (val, row, column, index) => {
						    return val.map(skill => {
						      return `<el-tag>${skill.name} (${skill.proficiency_level})</el-tag>`;
						    }).join(' ');
						  }
						},
						{
						    key: "video_url",
						    title: "视频链接",
						},
						{
						  key: "video_id",
						  title: "视频ID",
						  type: "text"
						}
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
					formData: {

					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [
						{
							key: "question_text",
							title: "面试问题",
							type: "text",
							width: 200,
							mode: "%%"
						},
						{
							key: "industry_name",
							title: "行业",
							type: "text",
							width: 140,
							mode: "%%"
						},
						{
							key: "position_name",
							title: "职位",
							type: "text",
							width: 140,
							mode: "%%"
						},
						{
							key: "level",
							title: "级别",
							type: "text",
							width: 140,
							mode: "%%"
						},
					// ... 保留其他字段
					]
				},
				
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						"industries_positions": ["001", "001-001-001"],
						"skills": [],
						"level": "beginner",
						"video_file": null,
						"video_character": "xiaojin",
						"video_language": "zh"
					},
					// 表单属性
					props: {
						// 表单提交地址
						action: '请替换自己的路由地址',
						// 表单字段显示规则
						columns: [{
							"key": "question_text",
							"title": "面试问题",
							"type": "textarea",
							"placeholder": "请输入面试问题",
							"showLabel": true,
							"autosize": {
								"minRows": 4,
								"maxRows": 4
							}
						}, {
							"action": "admin/iv-questions-manager/sys/getIndustryAndPositions",
							"key": "industries_positions",
							"title": "行业/职位",
							"type": "cascader",
							"placeholder": "请选择行业/职位",
							"clearable": true,
							"showLabel": true,
							"separator": "/"
						}, {
							"key": "skills",
							"title": "相关技能",
							"type": "checkbox",
							"showLabel": true,
							"data": [{
								"label": "html",
								"value": "html"
							}, {
								"label": "css",
								"value": "css"
							}, {
								"label": "js",
								"value": "js"
							}, {
								"label": "vue",
								"value": "vue"
							}, {
								"label": "react",
								"value": "react"
							}, {
								"label": "angular",
								"value": "angular"
							}, {
								"label": "webpack",
								"value": "webpack"
							}],
							"optionType": "default",
							"size": "medium"
						}, {
							"key": "level",
							"title": "难度级别",
							"type": "radio",
							"showLabel": true,
							"data": [{
								"label": "初级",
								"value": "beginner"
							}, {
								"label": "中级",
								"value": "intermediate"
							}, {
								"label": "高级",
								"value": "advanced"
							}],
							"size": "medium",
							"optionType": "default"
						}, {
							"key": "video_file",
							"title": "视频上传",
							"type": "file",
							"showLabel": true,
							"limit": 1,
							"listType": "picture",
							"fileSize": 10,
							"sizeUnit": "MB",
							"accept": ".mp4"
						}, {
							"key": "video_title",
							"title": "视频标题",
							"type": "text",
							"placeholder": "请输入视频标题",
							"clearable": true,
							"showLabel": true
						}, {
							"key": "video_character",
							"title": "视频角色",
							"type": "select",
							"placeholder": "请选择视频角色",
							"clearable": true,
							"showLabel": true,
							"data": [{
								"label": "小锦",
								"value": "xiaojin"
							}, {
								"label": "小程",
								"value": "xiaocheng"
							}]
						}, {
							"key": "video_language",
							"title": "视频语言",
							"type": "select",
							"placeholder": "请选择视频语言",
							"clearable": true,
							"showLabel": true,
							"data": [{
								"label": "中文",
								"value": "zh"
							}, {
								"label": "英文",
								"value": "en"
							}]
						}],
						// 表单验证规则
						rules: {
							"question_text": [{
								"required": true,
								"message": "面试问题不能为空",
								"trigger": "change"
							}],
							"industries_positions": [{
								"required": true,
								"message": "行业/职位不能为空",
								"trigger": "change"
							}],
							"skills": [{
								"required": true,
								"message": "相关技能不能为空",
								"trigger": "change"
							}],
							"level": [{
								"required": true,
								"message": "难度级别不能为空",
								"trigger": "change"
							}],
							"video_file": [{
								"required": true,
								"message": "视频上传不能为空",
								"trigger": "change"
							}],
							"video_title": [{
								"required": true,
								"message": "视频标题不能为空",
								"trigger": "change"
							}],
							"video_character": [{
								"required": true,
								"message": "视频角色不能为空",
								"trigger": "change"
							}],
							"video_language": [{
								"required": true,
								"message": "视频语言不能为空",
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
			playVideo(videoUrl) {
			    this.showVideoPlayer = true;
				this.videoSrc = videoUrl;
			    this.$nextTick(() => {
			        const videoPlayer = this.$refs.videoPlayer;
			        if (videoPlayer) {
			            videoPlayer.src = videoUrl;
			            videoPlayer.play();
			        } else {
			            console.error("videoPlayer ref is not defined!");
			        }
			    });
			},
			closeVideoPlayer() {
				this.showVideoPlayer = false;
				const videoPlayer = this.$refs.videoPlayer;
				videoPlayer.pause();
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
				that.form1.props.action = 'admin/iv-questions-manager/sys/add';
				that.form1.props.formType = 'add';
				that.form1.props.title = '添加';
				that.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({ item }) {
				that.form1.props.action = 'admin/iv-questions-manager/sys/update';
				that.form1.props.formType = 'update';
				that.form1.props.title = '编辑';
				that.form1.props.show = true;
				// 转换item的数据结构以匹配表单的数据结构
				let formData = {
					...item,
					industries_positions: [item.industry_id, item.position_id],
					skills: item.skills.map(skill => skill.name),
					level: (item.skills && item.skills[0]) ? item.skills[0].proficiency_level : '', // 假设所有技能的proficiency_level都是相同的
					// 如果有其他字段需要转换，可以在这里继续添加
				};
			
				that.form1.data = formData;
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/iv-questions-manager/sys/delete",
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
			}
		},
		// 监听属性
		watch: {

		},
		// 过滤器
		filters: {

		},
		// 计算属性
		computed: {

		}
	};
</script>
<style lang="scss" scoped>
.page-body {
	padding: 20px;
}
.video-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
	video {
		max-width: 80%;
		max-height: 80%;
	}
	.close-btn {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: #fff;
		padding: 5px 10px;
		border-radius: 5px;
		cursor: pointer;
	}
}

</style>
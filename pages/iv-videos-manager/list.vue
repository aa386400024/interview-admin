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
				>添加视频</el-button>
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
						<el-dropdown-item :command="1">批量删除</el-dropdown-item>
						<el-dropdown-item :command="2">批量下载</el-dropdown-item>
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
				data: {},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/iv-videos-manager/sys/getList",
					// 表格字段显示规则
					columns: [{
							key: "_id",
							title: "id",
							type: "text",
							width: 100
						},
						{
							key: "title",
							title: "视频标题",
							type: "text",
							width: 200
						},
						
						{
							key: "duration",
							title: "视频时长",
							type: "text",
							defaultValue: '未设置'
						},
						{
							key: "video_url",
							title: "视频链接",
						},
						{
						    key: "industry_name",
						    title: "所属行业",
						    type: "text"
						},
						{
						    key: "position_name",
						    title: "所属职位",
						    type: "text"
						},
						{
						    key: "character_name",
						    title: "视频角色",
						    type: "text"
						},
						{
							key: "language_name",
							title: "视频语言",
							type: "text",
							defaultValue: '未设置'
						},
						{
							key: "question_id",
							title: "问题ID",
							type: "text",
							defaultValue: '未设置'
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
					columns: [
						{
							key: "video_title",
							title: "视频标题",
							type: "text",
							width: 200,
							mode: "%%"
						},
						{
							key: "video_description",
							title: "视频描述",
							type: "text",
							width: 140,
							mode: "%%"
						}
					]
				},
				
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						"video_file": null,
						"video_title": "",
						"video_duration": ""
					},
					// 表单属性
					props: {
						// 表单提交地址
						action: 'admin/iv-videos-manager/sys/add',
						// 表单字段显示规则
						columns: [{
							"key": "video_title",
							"title": "视频标题",
							"type": "text",
							"required": true
						},{
							"key": "video_file",
							"title": "上传视频",
							"type": "file",
							"required": true
						}],
						// 表单验证规则
						rules: {
							"video_title": [{
								required: true,
								message: '请输入视频标题',
								trigger: 'blur'
							}],
							"video_file": [{
								required: true,
								message: '请上传视频文件',
								trigger: 'blur'
							}]
						},
						// 表单是否显示
						show: false,
						// 表单标题
						title: '添加视频',
						// 表单类型，add:添加，update:修改
						formType: 'add',
						// 表单是否加载中
						loading: false
					}
				}
				// 表单相关结束 -----------------------------------------------------------
			};
		},
		onLoad() {
			that = this;
			that.init();
		},
		methods: {
			// 页面初始化
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(that.form1);
			},
			// 查询表单搜索
			search() {
				that.$refs.table1.load();
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
			// 添加按钮
			addBtn() {
				that.resetForm();
				that.form1.props.action = 'admin/iv-videos-manager/sys/add';
				that.form1.props.formType = 'add';
				that.form1.props.title = '添加视频';
				that.form1.props.show = true;
			},
			// 修改按钮
			updateBtn({ item }) {
				that.form1.props.action = 'admin/iv-videos-manager/sys/update';
				that.form1.props.formType = 'update';
				that.form1.props.title = '编辑视频';
				that.form1.props.show = true;
				let formData = {
					...item
				};
				that.form1.data = formData;
			},
			// 删除按钮
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "admin/iv-videos-manager/sys/delete",
					data: {
						_id: item._id
					}
				});
			},
			// 批量操作
			batchBtn(command) {
				if (command === '1') {
					// 批量删除逻辑
				} else if (command === '2') {
					// 批量下载逻辑
				}
			},
			// 表单提交成功
			formSuccess() {
				that.form1.props.show = false;
				that.$refs.table1.load();
				this.refresh();
			},
			// 表单取消
			onCancel() {
				that.form1.props.show = false;
			},
			// 重置表单
			resetForm() {
				that.form1.data = JSON.parse(JSON.stringify(originalForms.form1));
			},
			playVideo(videoUrl) {
			    this.showVideoPlayer = true;
				this.videoSrc = videoUrl;
			    this.$nextTick(() => {
			        const videoPlayer = this.$refs.videoPlayer;
			        if (videoPlayer) {
			            videoPlayer.src = videoUrl;
			            setTimeout(() => {
			                videoPlayer.play();
			            }, 500); // 延迟100毫秒
			        } else {
			            console.error("videoPlayer ref is not defined!");
			        }
			    });
			},

			// 关闭视频播放器
			closeVideoPlayer() {
				this.showVideoPlayer = false;
				const videoPlayer = this.$refs.videoPlayer;
				videoPlayer.pause();
			},
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

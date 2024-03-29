<script setup>
import TablePagination from "@/layouts/components/TablePagination.vue";

const props = defineProps({
	columns: {
		type: Array,
		required: true,
		default: new Array()
	},
	items: {
		type: Array,
		default: new Array()
	},
	actions: {
		type: Array,
		default: new Array()
	},
	tableLength: {
		type: Number,
		default: 1
	},
	loading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['newPage'])

const newPage = (page = 1) => {
	emit('newPage', page)
}

const processText = (column, item) => {
	if (typeof column?.path == 'function') {
		return column?.path(item)
	}

	return column?.path ? eval(`item.${column.path} ?? '-'`) : '-'
}

const processChip = (column, item) => {
	return typeof column?.chipColor == 'function' ? column?.chipColor(item) : 'primary'
}

const columnCondition = (column) => {
	if (!column?.condition) {
		return true
	}
	return typeof column?.condition == 'function' ? column?.condition(column) : true
}

const btnClick = (action, item) => {
	return typeof action?.callback == 'function' ? action?.callback(item) : (() => { })
}

const btnCondition = (action, item) => {
	return typeof action?.condition == 'function' ? action?.condition(item) : true
}

</script>

<template>
	<VDivider />
	<VProgressLinear :active="props.loading" indeterminate />
	<VTable>
		<thead>
			<tr>
				<template v-for="column in props.columns">
					<th class="text-uppercase" v-if="columnCondition(column)">
						{{ column?.title ?? ' - ' }}
					</th>
				</template>
				<th class="text-uppercase text-center" v-if="props.actions.length > 0">
					Actions
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="item in props.items" :key="item">
				<template v-for="column in props.columns">
					<td v-if="columnCondition(column)">
						<VChip v-if="column?.chip ?? false" :color="processChip(column ?? null, item)">
							{{ processText(column, item) }}
						</VChip>
						<span v-else>
							{{ processText(column, item) }}
						</span>
					</td>
				</template>
				<td style="text-align: -webkit-center;" v-if="props.actions.length > 0">
					<template v-for="action in props.actions">
						<div style="display: table-cell">
							<VBtn v-if="btnCondition(action, item)" icon variant="text" width="30px" height="30px"
								@click="btnClick(action, item)">
								<VIcon :icon="action.icon" size="18" />
								<VTooltip activator="parent" location="end">
									{{ action.title }}
								</VTooltip>
							</VBtn>
						</div>
					</template>
				</td>
			</tr>
		</tbody>
	</VTable>
	<VDivider />
	<TablePagination :tableLength="props.tableLength" :isTableLoading="props.loading" @newPage="newPage" />
</template>

<style lang="scss">
.left {
	display: table-cell;
}

.right {
	display: table-cell;
	vertical-align: middle;
	padding-left: 15px;
}
</style>
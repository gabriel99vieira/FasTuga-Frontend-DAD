<script setup>
import ProductDetailsDialog from '@/layouts/components/ProductDetailsDialog.vue';
import Table from '@/layouts/components/Table.vue';
import { useOrderItemStore } from '@/stores/orderitem';
import { TableAction, TableColumn } from '@/utils/utils';
import { ref } from 'vue';

const toast = inject('toast')
const orderItemsStore = useOrderItemStore()

const isTableLoading = ref(true)
const tableLength = ref(1)
const itemBeingViewed = ref({})
const isDialogVisible = ref(false)

onBeforeMount(() => {
  nextPage()
})

const nextPage = (page = 1) => {
  isTableLoading.value = true
  orderItemsStore.load(page)
    .then((res) => tableLength.value = res?.data.meta.last_page || 1)
    .catch((err) => toast.error(err.message))
    .finally(() => isTableLoading.value = false)
}

const clickViewOrder = (item) => {
  itemBeingViewed.value = { ...item.product }
  isDialogVisible.value = true
}

const tableColumns = [
  new TableColumn({ title: "#", path: "id" }),
  new TableColumn({ title: "identification", path: "identification" }),
  new TableColumn({ title: "price", path: item => `${item.price}€` }),
  new TableColumn({ title: "Name", path: "product?.name" }),
]

const tableActions = [
  new TableAction({
    title: "View",
    icon: "mdi-eye",
    color: "tonal",
    callback: clickViewOrder
  })
]
</script>

<template>
  <VCol sm="12" md="12" lg="10" offset-lg="1">
    <VCard cols="12">
      <VCardText class="pt-4 pb-2">
        <VCardTitle class="pa-0 table-header">
          <VCardTitle class="pl-0 pt-1 table-title">Orders</VCardTitle>
        </VCardTitle>
      </VCardText>

      <Table :items="orderItemsStore.items" :columns="tableColumns" :loading="isTableLoading"
        :tableLength="tableLength" @newPage="nextPage" :actions="tableActions" />

    </VCard>
  </VCol>

  <VDialog v-model="isDialogVisible" max-width="625">
    <ProductDetailsDialog :product="itemBeingViewed" @close="isDialogVisible = false" />
  </VDialog>
</template>

<style scoped>
.table-header {
  display: flex;
}

.table-title {
  flex: auto;
}
</style>
<script setup>
import ChefBoardList from '@/layouts/components/ChefBoardList.vue';
import ProductDetailsDialog from '@/layouts/components/ProductDetailsDialog.vue';
import { OrderItemStatus, useOrderItemStore } from '@/stores/orderitem';
import { useOrdersStore } from '@/stores/orders';

const toast = inject('toast')

const ordersStore = useOrdersStore()
const orderItemStore = useOrderItemStore()
const isLoading = ref(true)
const isDialogVisibleDetails = ref(false)
const showProduct = ref(null)

const dialogOpen = (item) => {
    let product = item?.product ?? null
    showProduct.value = product
    if (product) {
        showProduct.value.image = product?.photo_url
    }
    isDialogVisibleDetails.value = true
}

const dialogClose = () => {
    isDialogVisibleDetails.value = false
}


const set = async (item, status) => {
    isLoading.value = true
    await orderItemStore.set(item, status)
        .then((res) => {
            // toast.success(res.data.message)
            load()
        }).catch((err) => {
            toast.error(err.response.data.message)
            isLoading.value = false
        })
}

const flatItems = computed(() => {
    return ordersStore.ordersBoard?.preparing.flatMap(order => order.items)
})

const itemsWaiting = computed(() => {
    return flatItems.value?.filter(item => item.status == OrderItemStatus.WAITING) ?? []
})

const itemsPreparing = computed(() => {
    return flatItems.value?.filter(item => item.status == OrderItemStatus.PREPARING) ?? []
})

const setPreparing = (item) => {
    return set(item, OrderItemStatus.PREPARING)
}

const setWaiting = (item) => {
    return set(item, OrderItemStatus.WAITING)
}

const setReady = (item) => {
    return set(item, OrderItemStatus.READY)
}

const load = async () => {
    return await ordersStore.fetchBoard().finally(() => isLoading.value = false)
}

onBeforeMount(async () => {
    await load()
})
</script>

<template>
    <VCol sm="12" md="12" lg="10" offset-lg="1">
        <VCard>
            <VProgressLinear :active="isLoading" indeterminate />
            <VRow no-gutters class="align-cards justify-start">

                <VCol cols="12" md="6">
                    <ChefBoardList board-title="Waiting" :items="itemsWaiting" :buttons="[{
                        name: 'Prepare',
                        action: setPreparing
                    }]" />
                </VCol>

                <VDivider :vertical="$vuetify.display.mdAndUp" :inset="$vuetify.display.mdAndUp" />

                <VCol cols="12" md="6">
                    <ChefBoardList board-title="Preparing" :items="itemsPreparing" :details-button="dialogOpen"
                        :buttons="[
                            {
                                name: 'Wait',
                                action: setWaiting
                            },
                            {
                                name: 'Ready',
                                action: setReady,
                                color: 'success'
                            }
                        ]" />
                </VCol>
            </VRow>

        </VCard>
    </VCol>

    <VDialog v-model="isDialogVisibleDetails" max-width="700">
        <ProductDetailsDialog @close="dialogClose" :product="showProduct" />
    </VDialog>
</template>

<style lang="scss">
.align-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
</style>

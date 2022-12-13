<script setup>

import ConfirmationDialog from "@/layouts/components/ConfirmationDialog.vue";
import { productType_LC, useProductStore } from "@/stores/product";
import { imageUrl, uploadImage } from "@/utils/utils";
import { computed } from "@vue/reactivity";
import { onUnmounted } from "vue";

const productStore = useProductStore()
const toast = inject('toast')

const confirmDialog = ref(null)
const refInputEl = ref()

const emit = defineEmits(["close", "save"]);
const props = defineProps(['product'])
const loading = ref(true)
const errors = ref(null)
const product = ref({
	...props.product,
	image: imageUrl(props.product?.photo_url)
})

const hasChanges = computed(() => {
	return product.value.image != imageUrl(props.product?.photo_url)
		|| product.value.name != props.product?.name
		|| product.value.type != props.product?.type
		|| product.value.description != props.product?.description
		|| product.value.price != props.product?.price
})

const close = async () => {
	if (hasChanges.value) {
		if (await confirmDialog.value.open({ message: "Do you really want to leave? You have unsaved changes!" })) {
			emit("close");
		}
	} else {
		emit("close");
	}
};

const destroy = async () => {
	if (product.value?.id) {
		loading.value = true
		if (await confirmDialog.value.open({ message: "Do you really want to delete this product?" })) {
			confirmDialog.value.close()
			productStore.destroy(product.value)
				.then((res) => {
					productStore.load()
					loading.value = false
					toast.success(res.data.message)
					emit("close");
				}).catch((err) => {
					loading.value = false
					toast.error("Unable to delete product.")
				})
		} else {
			confirmDialog.value.close()
			loading.value = false
		}
	}
}

const save = async () => {
	loading.value = true
	if (!hasChanges.value) {
		loading.value = false
		return emit("close");
	}

	productStore.save(product.value)
		.then((res) => {
			productStore.load()
			loading.value = false
			toast.success(res.data.message)
			emit("save");
		}).catch((err) => {
			loading.value = false
			toast.error(err.response.data.message ?? (err.message + ": Your image might be too large."))
			setErrors(err.response.data.errors)
		})
};

const setErrors = (err) => {
	errors.value = {
		name: err?.name,
		type: err?.type,
		price: err?.price,
		description: err?.description,
	}
}

const clickUploadImage = async (file) => {
	product.value.image = await uploadImage(file)
}

onBeforeMount(() => {
	loading.value = true
})

onMounted(() => {
	loading.value = false
})

onUnmounted(() => {
	emit("close");
})

</script>

<template>
	<VCard :title="props.product ? 'Edit' : 'Create'" class="py-2">
		<VCardText>
			<VRow>
				<VCol cols="12" xs="12" sm="5">
					<div class="upload-image-wrapper">
						<VAvatar rounded color="primary" size="192" variant="tonal" :image="product?.image" />
						<VBtn color="secondary" icon="mdi-upload" class="upload-image-icon"
							@click="refInputEl?.click()" />
						<input ref="refInputEl" type="file" name="file" accept=".jpeg,.png,.jpg" hidden
							@input="clickUploadImage">
					</div>
				</VCol>
				<VCol cols="12" xs="12" sm="7" class="pt-0">
					<VCol class="px-0">
						<VTextField v-model="product.name" label="Name" required :error-messages="errors?.name" />
					</VCol>
					<VCol class="px-0">
						<VSelect v-model="product.type" :items="productType_LC" label="Type" required
							:error-messages="errors?.type" />
					</VCol>
					<VCol class="px-0">
						<VTextField type="number" v-model="product.price" label="Price" required
							:error-messages="errors?.price" />
					</VCol>
					<VCol class="px-0">
						<VTextarea v-model="product.description" label="Description" required
							:error-messages="errors?.description" />
					</VCol>
				</VCol>
			</VRow>
		</VCardText>
		<VCardActions class="pr-5">
			<VSpacer />
			<VBtn color="on-secondary" variant="outlined" @click="close">
				Close
			</VBtn>
			<VBtn color="error" v-if="props.product" variant="outlined" @click="destroy">
				Delete
			</VBtn>
			<VBtn color="primary" variant="elevated" @click="save" :loading="loading" :disabled="!hasChanges">
				Save
			</VBtn>
		</VCardActions>
		<VProgressLinear :active="loading" indeterminate />
	</VCard>

	<ConfirmationDialog ref="confirmDialog" />
</template>

<style lang="scss">
.upload-image-wrapper {
	max-width: 192px;
	max-height: 192px;
}

.upload-image-icon {
	position: relative;
	bottom: 3.5em;
	left: 8.5em;
}
</style>
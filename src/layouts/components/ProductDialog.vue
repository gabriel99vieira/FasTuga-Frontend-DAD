<script setup>
import defaultPlate from "@/assets/images/defaultPlate.png";
import ConfirmationDialog from "@/layouts/components/ConfirmationDialog.vue";
import { productType_LC, useProductStore } from "@/stores/product";
import { imageUrl, uploadImage } from "@/utils/utils";
import { priceRules, productNameRules } from "@/utils/validations";
import { computed } from "@vue/reactivity";
import { onUnmounted } from "vue";

const form = ref(null)
const productStore = useProductStore()
const toast = inject('toast')

const confirmDialog = ref(null)
const refInputEl = ref()
const defaultImage = ref(defaultPlate)

const emit = defineEmits(["close", "save"]);
const props = defineProps(['product'])
const loading = ref(false)
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
	if (!product.value?.id) {
		return
	}

	if (await confirmDialog.value.open({ message: "Do you really want to delete this product?" })) {
		loading.value = true
		confirmDialog.value.close()
		productStore.destroy(product.value)
			.then((res) => {
				productStore.load()
				toast.success(res.data.message)
				emit("close");
			}).catch((err) => {
				loading.value = false
				toast.error("Unable to delete product.")
			}).finally(() => loading.value = false)
	}
}

const save = async () => {
	if (!hasChanges.value) {
		return emit("close");
	}

	const validation = await form.value.validate();
	if (!validation.valid)
		return;

	loading.value = true
	productStore.save(product.value)
		.then((res) => {
			productStore.load()
			loading.value = false
			toast.success(res.data.message)
			emit("save");
		}).catch((err) => {
			console.log(err)
			loading.value = false
			toast.error(err.response?.statusText ?? err.response.data.message ?? (err.message + ": Your image might be too large."))
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

onUnmounted(() => {
	emit("close");
})
</script>

<template>
	<VCard :title="props.product ? 'Edit Product' : 'Create Product'" class="product-view">
		<VCardText>
			<VRow>
				<VCol style="position:relative">
					<VAvatar rounded color="primary" class="product-img" variant="tonal"
						:image="product?.image ? product.image : defaultImage" />
					<VBtn color="secondary" icon="mdi-upload" class="upload-btn" @click="refInputEl?.click()" />
					<input ref="refInputEl" type="file" name="file" accept=".jpeg,.png,.jpg" hidden
						@input="clickUploadImage">
				</VCol>
				<VCol cols="12" xs="12" sm="12" md="7" class="pt-0">
					<VForm ref="form" @submit.prevent="() => { }">
						<VCol class="px-0">
							<VTextField v-model="product.name" label="Name" :error-messages="errors?.name"
								:rules="productNameRules" />
						</VCol>
						<VCol class="px-0">
							<VSelect v-model="product.type" :items="productType_LC" label="Type" required
								:error-messages="errors?.type" />
						</VCol>
						<VCol class="px-0">
							<VTextField type="number" min="0" v-model="product.price" label="Price"
								:error-messages="errors?.price" :rules="priceRules" />
						</VCol>
					</VForm>
				</VCol>
			</VRow>
			<VCol class="px-0">
				<VTextarea v-model="product.description" label="Description" required rows="3"
					:error-messages="errors?.description" :rules="[v => !!v || 'Description is required']" />
			</VCol>
		</VCardText>
		<VCardActions class="pr-5">
			<VSpacer />
			<VBtn color="on-secondary" variant="outlined" @click="close" :disabled="loading">
				Close
			</VBtn>
			<VBtn color="error" v-if="props.product" variant="outlined" @click="destroy" :disabled="loading">
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

<style>
.product-view .upload-btn {
	position: absolute;
	top: 163px;
	left: 230px;
}

.product-view .product-img {
	height: 192px;
	width: 256px;
}
</style>
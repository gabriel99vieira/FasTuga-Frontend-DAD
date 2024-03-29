<script setup>
import defaultAvatar from "@/assets/images/avatars/avatar-2.png";
import { CHEF, CUSTOMER, DELIVERY, MANAGER, profilePhotoUrl, uploadImage, userRole } from "@/utils/utils";
import { emailRules, nameRules } from '@/utils/validations';
import { computed } from "@vue/reactivity";
import { onUnmounted } from "vue";
import ConfirmationDialog from "./ConfirmationDialog.vue";

const form = ref(null)
const roles = [
  { type: CHEF, title: userRole(CHEF) },
  { type: DELIVERY, title: userRole(DELIVERY) },
  { type: MANAGER, title: userRole(MANAGER) }
]
const confirmDialog = ref(null)
const refInputEl = ref()
const employeePhoto = ref(defaultAvatar)

const user = ref({
  name: '',
  email: '',
  type: 'ED',
  blocked: 0,
  photo_url: ''
})

const props = defineProps({
  user: {
    type: Object
  },
  isLoading: {
    type: Boolean
  }
})

const emit = defineEmits(["close", "save"]);
const closeClick = async () => {
  if (!newData.value) //Changes occured
    return emit("close");

  if (await confirmDialog.value.open({ message: "Do you really want to leave? You have unsaved changes!" })) {
    return emit("close");
  }
};

const saveClick = async (user) => {
  if (!newData.value)
    return emit("close");

  const validation = await form.value.validate();
  if (!validation.valid)
    return;

  if (newPhoto.value)
    user.image = employeePhoto

  emit("save", user, operation.value);
};

const clickUploadImage = async (file) => {
  employeePhoto.value = await uploadImage(file)
}

const newData = computed(() => {
  return operation.value === 'create' ?
    user.value.name != '' || user.value.email != '' :
    JSON.stringify(user.value) != JSON.stringify(props.user) || newPhoto.value
})

const newPhoto = computed(() => {
  return employeePhoto.value != profilePhotoUrl(user.value.photo_url)
})

const operation = computed(() => (!props.user) ? 'create' : 'update')

const dialogTitle = computed(() => operation.value === 'create' ? 'New Account' : 'Update Account')

onMounted(() => {
  //if a user was passed (edit user) it populates de fields, else (new user) keeps the default + empty values
  if (props.user) {
    user.value = { ...props.user }
    employeePhoto.value = profilePhotoUrl(user.value.photo_url)
  }
})

onUnmounted(() => {
  emit("close");
})
</script>

<template>
  <VCard :title="dialogTitle" class="profile-view">
    <VCardText>
      <VRow>
        <VCol style="position:relative">
          <VAvatar rounded color="primary" size="192" variant="tonal" :image="employeePhoto" />
          <VBtn v-if="user.type != CUSTOMER" color="secondary" icon="mdi-upload" class="photo-upload-btn"
            @click="refInputEl?.click()" />
          <input ref="refInputEl" type="file" name="file" accept=".jpeg,.png,.jpg" hidden @input="clickUploadImage">
        </VCol>
        <VCol xs="12" sm="7" lg="7" xl="7" class="pt-0">
          <VForm ref="form" @submit.prevent="() => { }">
            <VCol class="pl-0 pr-0">
              <VTextField v-model="user.name" label="Name" prepend-inner-icon="mdi-account-outline" :rules="nameRules"
                required :disabled="(user.type == CUSTOMER)" />
            </VCol>
            <VCol class="pl-0 pr-0">
              <VTextField v-model="user.email" label="E-mail" type="email" prepend-inner-icon="mdi-email-outline"
                :rules="emailRules" required :disabled="(user.type == CUSTOMER)" />
            </VCol>
            <VCol class="pl-0 pr-0">
              <VSelect v-if="(user.type != CUSTOMER)" v-model="user.type" :items="roles" item-value="type"
                item-text="title" label="Role" prepend-inner-icon="mdi-account-cog-outline" />
            </VCol>
          </VForm>
        </VCol>
      </VRow>
    </VCardText>
    <VCardActions class="pr-5">
      <VSwitch v-model="user.blocked" label="Block Account" class="pl-3" />
      <VSpacer />
      <VBtn color="on-secondary" variant="outlined" @click="closeClick">
        Close
      </VBtn>
      <VBtn color="primary" variant="flat" @click="saveClick(user)" :disabled="!newData">
        Save
      </VBtn>
    </VCardActions>
    <VProgressLinear :active="props.isLoading" indeterminate />
  </VCard>

  <ConfirmationDialog ref="confirmDialog" />
</template>

<style>
.profile-view .photo-upload-btn {
  position: absolute;
  top: 163px !important;
  bottom: 0px !important;
  right: 41px;
  left: 168px;
}
</style>
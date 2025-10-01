<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1>Users</h1>
      <a-button type="primary" @click="isUserModalVisible = true">Add User</a-button>
    </div>
    <a-table :dataSource="users" :columns="userColumns" rowKey="name" />

    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1>Locations</h1>
      <a-button type="primary" @click="isLocationModalVisible = true">Add Location</a-button>
    </div>
    <a-table :dataSource="locations" :columns="locationColumns" rowKey="id" />

    <!-- User Modal -->
    <a-modal v-model:open="isUserModalVisible" :title="selectedUser ? 'Edit User' : 'Add User'" @ok="handleAddUser" @cancel="handleUserModalCancel">
      <a-input placeholder="Name" v-model:value="newUser.name" />
      <a-input placeholder="Age" type="number" v-model:value="newUser.age" />
      <a-input placeholder="Cell" v-model:value="newUser.cell" />
      <a-input placeholder="Address" v-model:value="newUser.address" />
    </a-modal>

    <!-- Location Modal -->
    <a-modal v-model:open="isLocationModalVisible" :title="selectedLocation ? 'Edit Location' : 'Add Location'" @ok="handleAddLocation" @cancel="handleLocationModalCancel">
      <a-input placeholder="ID" v-model:value="newLocation.id" />
      <a-input placeholder="City" v-model:value="newLocation.city" />
      <a-input placeholder="Country" v-model:value="newLocation.country" />
    </a-modal>

    <!-- <div v-if="error" style="color: red">{{ error }}</div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { Table, Button, Modal, Input, Space } from 'ant-design-vue';
import useIDBOperations from './useIDBOperations';
import { User, Location } from './IDBOperations';

const { initializeDB, createItem, readItem, updateItem, deleteItem, listItems } = useIDBOperations();

const users = ref<User[]>([]);
const locations = ref<Location[]>([]);
const selectedUser = ref<User | null | undefined>(null);
const selectedLocation = ref<Location | null | undefined>(null);
const isUserModalVisible = ref(false);
const isLocationModalVisible = ref(false);
const newUser = ref<User>({ name: '', age: 0, address: '', cell: '' });
const newLocation = ref<Location>({ id: '', city: '', country: '' });

onMounted(async () => {
  await initializeDB('idb-crud-vue', [User, Location]);
  users.value = await listItems(User) || [];
  locations.value = await listItems(Location) || [];
});

const userColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  { title: 'Cell', dataIndex: 'cell', key: 'cell' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: User) => 
      h(Space, { size: 'middle' }, [
        h(Button, { 
          type: 'primary', 
          onClick: () => handleEditUser(record.name) 
        }, 'Edit'),
        h(Button, { 
          type: 'primary', 
          onClick: () => handleDeleteUser(record.name) 
        }, 'Delete')
      ])
  },
];

const locationColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'City', dataIndex: 'city', key: 'city' },
  { title: 'Country', dataIndex: 'country', key: 'country' },
  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: Location) =>
      h(Space, { size: 'middle' }, [
        h(Button, { 
          type: 'primary', 
          onClick: () => handleEditLocation(record.id) 
        }, 'Edit'),
        h(Button, { 
          type: 'primary', 
          onClick: () => handleDeleteLocation(record.id) 
        }, 'Delete')
      ])
  },
];

const handleEditUser = async (name: string) => {
  selectedUser.value = await readItem(User, name);
  isUserModalVisible.value = true;
};

const handleDeleteUser = async (name: string) => {
  selectedUser.value = await readItem(User, name);
  isUserModalVisible.value = true;
};

const handleEditLocation = async (id: string) => {
  selectedLocation.value = await readItem(Location, id);
  isLocationModalVisible.value = true;
};

const handleDeleteLocation = async (id: string) => {
  selectedLocation.value = await readItem(Location, id);
  isLocationModalVisible.value = true;
};

const handleAddUser = async () => {
  if (selectedUser.value) await updateItem(User, newUser.value);
  else await createItem(User, newUser.value);
  users.value = await listItems(User) || [];
  isUserModalVisible.value = false;
  newUser.value = { name: '', age: 0, address: '', cell: '' };
  selectedUser.value = null;
};

const handleAddLocation = async () => {
  if (selectedLocation.value) await updateItem(Location, newLocation.value);
  else await createItem(Location, newLocation.value);
  locations.value = await listItems(Location) || [];
  isLocationModalVisible.value = false;
  newLocation.value = { id: '', city: '', country: '' };
  selectedLocation.value = null;
};

const handleUserModalCancel = () => {
  isUserModalVisible.value = false;
  selectedUser.value = null;
};

const handleLocationModalCancel = () => {
  isLocationModalVisible.value = false;
  selectedLocation.value = null;
};
</script>

<style scoped>
/* Add your styles here */
</style>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1>Users</h1>
      <a-button type="primary" @click="setIsUserModalVisible">Add User</a-button>
    </div>
    <a-table :dataSource="users" :columns="userColumns" rowKey="name" :loading="loading" />

    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1>Locations</h1>
      <a-button type="primary" @click="setIsLocationModalVisible">Add Location</a-button>
    </div>
    <a-table :dataSource="locations" :columns="locationColumns" rowKey="id" :loading="loading" />

    <!-- User Modal -->
    <a-modal
      :title="selectedUser ? 'Edit User' : 'Add User'"
      v-model:open="isUserModalVisible"
      @ok="handleAddUser"
      @cancel="handleUserModalCancel"
    >
      <a-input placeholder="Name" v-model:value="newUser.name" />
      <a-input placeholder="Age" type="number" v-model:value="newUser.age" />
      <a-input placeholder="Cell" v-model:value="newUser.cell" />
      <a-input placeholder="Address" v-model:value="newUser.address" />
    </a-modal>

    <!-- Location Modal -->
    <a-modal
      :title="selectedLocation ? 'Edit Location' : 'Add Location'"
      v-model:open="isLocationModalVisible"
      @ok="handleAddLocation"
      @cancel="handleLocationModalCancel"
    >
      <a-input placeholder="ID" v-model:value="newLocation.id" />
      <a-input placeholder="City" v-model:value="newLocation.city" />
      <a-input placeholder="Country" v-model:value="newLocation.country" />
    </a-modal>

    <div v-if="error" style="color: red">{{ error }}</div>
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted, computed } from 'vue';
import { Table, Button, Modal, Input, notification, Space } from 'ant-design-vue';
import useIDBOperations from './useIDBOperations';
import { User, Location } from './IDBOperations';

const { db, loading, error, initializeDB, createItem, readItem, updateItem, deleteItem, listItems } = useIDBOperations();

const users = ref<User[]>([]);
const locations = ref<Location[]>([]);
const selectedUser = ref<User | null>(null);
const selectedLocation = ref<Location | null>(null);
const isUserModalVisible = ref(false);
const isLocationModalVisible = ref(false);
const newUser = ref<User>({ name: '', age: 0, address: '', cell: '' });
const newLocation = ref<Location>({ id: '', city: '', country: '' });

onMounted(async () => {
  await initializeDB('idb-crud', [User, Location]);
  const usersList = await listItems(User);
  const locationsList = await listItems(Location);
  if (usersList) users.value = usersList;
  if (locationsList) locations.value = locationsList;
});

const userColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  { title: 'Cell', dataIndex: 'cell', key: 'cell' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: User) => (
      <Space size="middle">
        <Button type='primary' onClick={() => { handleEditUser(record.name); newUser.value = record; }}>Edit</Button>
        <Button type='primary' onClick={() => handleDeleteUser(record.name)}>Delete</Button>
      </Space>
    ),
  },
];

const locationColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'City', dataIndex: 'city', key: 'city' },
  { title: 'Country', dataIndex: 'country', key: 'country' },
  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: Location) => (
      <Space size="middle">
        <Button type='primary' onClick={() => { handleEditLocation(record.id); newLocation.value = record; }}>Edit</Button>
        <Button type='primary' onClick={() => handleDeleteLocation(record.id)}>Delete</Button>
      </Space>
    ),
  },
];

const handleDeleteUser = async (name: string) => {
  await deleteItem(User, name);
  const updatedUsers = await listItems(User);
  if (updatedUsers) users.value = updatedUsers;
};

const handleDeleteLocation = async (id: string) => {
  await deleteItem(Location, id);
  const updatedLocations = await listItems(Location);
  if (updatedLocations) locations.value = updatedLocations;
};

const handleEditUser = async (name: string) => {
  const user = await readItem(User, name);
  selectedUser.value = user || null;
  isUserModalVisible.value = true;
};

const handleEditLocation = async (id: string) => {
  const location = await readItem(Location, id);
  selectedLocation.value = location || null;
  isLocationModalVisible.value = true;
};

const handleAddUser = async () => {
  if (newUser.value) {
    if (selectedUser.value) {
      await updateItem(User, newUser.value);
    } else {
      await createItem(User, newUser.value);
    }
    const updatedUsers = await listItems(User);
    if (updatedUsers) users.value = updatedUsers;
    isUserModalVisible.value = false;
    newUser.value = { name: '', age: 0, address: '', cell: '' };
    selectedUser.value = null;
  }
};

const handleAddLocation = async () => {
  if (newLocation.value) {
    if (selectedLocation.value) {
      await updateItem(Location, newLocation.value);
    } else {
      await createItem(Location, newLocation.value);
    }
    const updatedLocations = await listItems(Location);
    if (updatedLocations) locations.value = updatedLocations;
    isLocationModalVisible.value = false;
    newLocation.value = { id: '', city: '', country: '' };
    selectedLocation.value = null;
  }
};

const handleUserModalCancel = () => {
  isUserModalVisible.value = false;
  selectedUser.value = null;
  newUser.value = { name: '', age: 0, address: '', cell: '' };
};

const handleLocationModalCancel = () => {
  isLocationModalVisible.value = false;
  selectedLocation.value = null;
  newLocation.value = { id: '', city: '', country: '' };
};

const setIsUserModalVisible = () => {
  isUserModalVisible.value = true;
};
const setIsLocationModalVisible = () => {
  isLocationModalVisible.value = true;
};
</script>

<style scoped>
/* Add your styles here */
</style>
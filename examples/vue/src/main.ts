import { createApp } from 'vue'
import Landing from './Landing.vue'
import Antd from 'ant-design-vue';


const app = createApp(Landing);
app.use(Antd);
app.mount('#app');
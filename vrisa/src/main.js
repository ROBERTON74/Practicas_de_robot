import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import VueCookies from 'vue-cookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue';
import AdminHome from '@/components/admin/Home.vue';
import Table from '@/components/admin/Table.vue';
import RemoteLab from '@/components/RemoteLab.vue';
import ActivityEditor from '@/components/admin/ActivityEditor.vue'
import Analytics from '@/components/stats/Analytics.vue'

import {
  Session,
  ActivityModel,
  ViewModel,
  ControllerModel,
  UserModel,
  CourseModel,
} from '@/assets/vrisa-library.js';


const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Login },
    { path: '/home', component: Home },
    { path: '/stats', component: Analytics },
    { path: '/admin', component: AdminHome },
    { path: '/admin/activity', component: Table, props: ActivityModel },
    { path: '/admin/view', component: Table, props: ViewModel },
    { path: '/admin/controller', component: Table, props: ControllerModel },
    { path: '/admin/users', component: Table, props: UserModel },
    { path: '/admin/courses', component: Table, props: CourseModel },
    { path: '/remotelab', component: RemoteLab, props: { builtin: false } },
    { path: '/activity/:name', component: ActivityEditor },
    // {path: '/view', component: ViewsPanel },
    // {path: '/courses/edit', component: CourseEditorPanel },
  ],
});

const session = new Session('http://147.96.71.236');
router.beforeResolve(async (to, from, next) => {
  const user = await session.authenticate()
    .then(user => {
      console.log(`The user ${!user || user.username} is authenticated: ${session.user != null}`)
      return (to.path === '/') ? next('/home') : next();
    })
    .catch(error => {
      return to.path !== '/' ? next('/') : next();
    });
});

createApp(App, { session }).use(router).use(VueCookies).mount('#app');

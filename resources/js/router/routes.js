function page(path) {
  return () => import(/* webpackChunkName: '' */ `~/pages/${path}`).then(m => m.default || m)
}

export default [
  { path: '/', name: 'index', component: page('home.vue') },

  { path: '/login', name: 'login', meta: { title: 'Log In' }, component: page('auth/login.vue') },
  { path: '/register', name: 'register', meta: { title: 'Register' }, component: page('auth/register.vue') },
  { path: '/password/reset', name: 'password.request', component: page('auth/password/email.vue') },
  { path: '/password/reset/:token', name: 'password.reset', component: page('auth/password/reset.vue') },
  { path: '/email/verify/:id', name: 'verification.verify', component: page('auth/verification/verify.vue') },
  { path: '/email/resend', name: 'verification.resend', component: page('auth/verification/resend.vue') },
  { path: '/email/check', name: 'verification.check', component: page('auth/verification/check.vue') },

  {
    path: '/profile',
    component: page('profile'),
    children: [
      { path: '', redirect: { name: 'profile.projects' } },
      { path: 'projects', name: 'profile.projects', meta: { title: 'Profile' }, component: page('profile/projects.vue') },
      { path: 'wishlists', name: 'profile.wishlist', meta: { title: 'Profile' }, component: page('profile/wishlist.vue') },
      { path: 'info', name: 'profile.info', meta: { title: 'Profile' }, component: page('profile/info.vue') }
    ]
  },

  { path: '/leaderboard', name: 'leaderboard', meta: { title: 'Leaderboard' }, component: page('leaderboard.vue') },
  { path: '/quest', name: 'quest', meta: { title: 'Quest' }, component: page('quest.vue') },
  { path: '/inbox', name: 'inbox', meta: { title: 'Inbox' }, component: page('inbox.vue') },
  { path: '/projectbox', name: 'projectbox', meta: { title: 'Project Box' }, component: page('projectbox.vue') },


  {
    path: '/newcomer',
    component: page('auth/newcomer'),
    children: [
      { path: '', redirect: { name: 'newcomer.page1' } },
      { path: '1', name: 'newcomer.page1', component: page('auth/newcomer/page1.vue') },
      { path: '2', name: 'newcomer.page2', component: page('auth/newcomer/page2.vue') },
      { path: '3', name: 'newcomer.page3', component: page('auth/newcomer/page3.vue') }
    ]
  },

  {
    path: '/profile/edit',
    component: page('editprofile'),
    children: [
      { path: '', redirect: { name: 'editprofile.page1' } },
      { path: 'page1', name: 'editprofile.page1', meta: { title: 'Edit Profile' }, component: page('editprofile/page1.vue') },
      { path: 'page2', name: 'editprofile.page2', meta: { title: 'Edit Profile' }, component: page('editprofile/page2.vue') }
    ]
  },

  {
    path: '/@/:tagname',
    component: page('visit'),
    children: [
      { path: '', redirect: { name: '@.info' } },
      { path: 'projects', name: '@.projects', component: page('visit/projects.vue') },
      { path: 'wishlists', name: '@.wishlist', component: page('visit/wishlist.vue') },
      { path: 'info', name: '@.info', component: page('visit/info.vue') }
    ]
  },

  { path: '/@/:tagname/message', name: 'message', component: page('message.vue') },

  {
    path: '/settings',
    component: page('settings'),
    children: [
      { path: '', redirect: { name: 'settings.profile' } },
      { path: 'profile', name: 'settings.profile', meta: { title: 'Settings' }, component: page('settings/profile.vue') },
      { path: 'password', name: 'settings.password', meta: { title: 'Settings' }, component: page('settings/password.vue') }
    ]
  },

  { path: '/explore', name: 'explore', meta: {
    title: 'Explore' }, component: page('explore.vue') },
  { path: '/project/post', name: 'project.post', meta: {
    title: 'Post Project' }, component: page('project/post.vue') },
  { path: '/project/:id', name: 'project.details', meta: {
    title: 'Project' }, component: page('project/details.vue') },
    { path: '/project/:id/dashboard', name: 'project.dashboard', meta: { title: 'Project' }, component: page('project/dashboard') },

  {
    path: '/project/:id/apply',
    component: page('project/apply'),
    children: [
      { path: '', redirect: { name: 'project.apply.individual' } },
      { path: '/project/:id/apply/individual', name: 'project.apply.individual', meta: { title: 'Apply Project' }, component: page('project/apply/individual.vue') },
      { path: '/project/:id/apply/team', name: 'project.apply.team', meta: { title: 'Apply Project' }, component: page('project/apply/team.vue') }
    ]
  },


  { path: '/project/create', name: 'project.create',
    meta: { title: 'Post Project' }, component: page('project/details.vue') },

  { path: '*', meta: { title: 'Error' }, component: page('errors/404.vue') }
]

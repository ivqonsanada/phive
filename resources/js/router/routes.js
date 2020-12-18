function page(path) {
  return () => import(/* webpackChunkName: '' */ `~/pages/${path}`).then(m => m.default || m)
}

export default [
  { path: '/', name: 'index', component: page('Home.vue') },
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

  { path: '/leaderboard', name: 'leaderboard', meta: { title: 'Leaderboard' }, component: page('Leaderboard.vue') },
  { path: '/inbox', name: 'inbox', meta: { title: 'Inbox' }, component: page('Inbox.vue') },
  { path: '/projectbox', name: 'projectbox', meta: { title: 'Project Box' }, component: page('ProjectBox.vue') },

  {
    path: '/party',
    component: page('party'),
    children: [
      { path: '', redirect: { name: 'party.leader' } },
      { path: 'leader', name: 'party.leader', meta: { title: 'Party' }, component: page('party/leader.vue') },
      { path: 'member', name: 'party.member', meta: { title: 'Party' }, component: page('party/member.vue') },
    ]
  },

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
      { path: 'projects', name: '@.projects', component: page('visit/Projects.vue') },
      { path: 'wishlists', name: '@.wishlist', component: page('visit/Wishlist.vue') },
      { path: 'info', name: '@.info', component: page('visit/Info.vue') }
    ]
  },

  { path: '/@/:tagname/message', name: 'message', component: page('Message.vue') },

  { path: '/settings', name: 'settings', meta: { title: 'Settings' }, component: page('settings') },

  { path: '/explore', name: 'explore', meta: { title: 'Explore' }, component: page('Explore.vue') },

  { path: '/project/post', name: 'project.post', meta: { title: 'Post Project' }, component: page('project/ProjectPost.vue') },
  { path: '/project/:id/edit-post', name: 'project.editpost', meta: { title: 'Edit Project' }, component: page('project/ProjectEdit.vue') },
  { path: '/project/:id', name: 'project.details', meta: { title: 'Project' }, component: page('project/ProjectDetails.vue') },
  { path: '/project/:id/review', name: 'project.review', meta: { title: 'Review Project' }, component: page('project/ProjectReview.vue') },
  { path: '/project/:id/dashboard', name: 'project.dashboard', meta: { title: 'Project' }, component: page('project/dashboard') },

  {
    path: '/project/:id/shorlisted',
    component: page('project/shortlist'),
    children: [
      { path: '', redirect: { name: 'shortlist.individual' } },
      { path: '/project/:id/shorlisted/individual', name: 'shortlist.individual', meta: { title: 'Apply Project' }, component: page('project/shortlist/ShortlistIndividual.vue') },
      { path: '/project/:id/shorlisted/team', name: 'shortlist.team', meta: { title: 'Apply Project' }, component: page('project/shortlist/ShortlistTeam.vue') }
    ]
  },

  {
    path: '/project/:id/apply',
    component: page('project/apply'),
    children: [
      { path: '', redirect: { name: 'project.apply.individual' } },
      { path: '/project/:id/apply/individual', name: 'project.apply.individual', meta: { title: 'Apply Project' }, component: page('project/apply/individual.vue') },
      { path: '/project/:id/apply/team', name: 'project.apply.team', meta: { title: 'Apply Project' }, component: page('project/apply/team.vue') }
    ]
  },


  { path: '/project/create', name: 'project.create', meta: { title: 'Post Project' }, component: page('project/details.vue') },

  { path: '/:url/404', name: '404', meta: { title: 'Error' }, component: page('errors/404.vue') },

  { path: '*', meta: { title: 'Error' }, component: page('errors/404.vue') }
]

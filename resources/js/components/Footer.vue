<template>
  <div class="footer__container">
    <div><img src="/images/footer-logo.svg" alt=""></div>

    <div class="footer-nav__section">
      <div class="footer-nav__menu">
        <span>Company</span>
        <span class="iconify footer-nav__icon" data-icon="entypo:chevron-small-down" data-inline="true" />
      </div>
      <div class="footer-nav__menu">
        <span>Further Information</span>
        <span class="iconify footer-nav__icon" data-icon="entypo:chevron-small-down" data-inline="true" />
      </div>
    </div>
    <div class="footer-icon__section">
      <div>Connect with us</div>
      <div class="footer-icon__container">
        <div>
          <span class="iconify footer-icon__item" data-icon="ant-design:instagram-outlined" data-inline="false" />
        </div>
        <div>
          <span class="iconify footer-icon__item" data-icon="ant-design:twitter-outlined" data-inline="false" />
        </div>
        <div>
          <span class="iconify footer-icon__item" data-icon="la:linkedin-in" data-inline="false" />
        </div>
        <div>
          <span class="iconify footer-icon__item" data-icon="la:facebook-f" data-inline="false" />
        </div>
      </div>
    </div>
    <div class="footer__copyright">
      PHive, All Rights Reserved. &copy; 2020
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {

  metaInfo () {
    return { title: 'Settings' }
  },

  data: () => ({
    wishlists: '',
    searchQuery: ''
  }),

  computed: {
    ...mapGetters({
      // user: 'auth/user',
      // data: 'auth/data'
    })
  },

  mounted () {
    // this.getWishlist()
  },

  methods: {
    // async getWishlist () {
    //   this.wishlists = this.data.wishlists
    // }
  }
}
</script>

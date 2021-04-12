<template>
  <div class="info-container">
    <div class="info--left">
      <div>
        <h3 class="info__h3">
          Biography
        </h3>
        <p class="info__p">
          {{ data.user.biography ? data.user.biography : '-' }}
        </p>
      </div>

      <div class="info__sub--container">
        <h3 class="info__h3">
          Skills
        </h3>
        <div class="info__skill-container">
          <BubbleSkill v-for="(skill, index) in data.user.skills" :key="`UserSkill-${index}`" :color="`blue`" :name="skill.name" />
          <p v-if="data.user.skills && data.user.skills.length === 0" class="info__p margin-0_5">
            No skills to show yet
          </p>
        </div>
      </div>

      <div v-if="!$matchMedia.xl" class="info__sub--container">
        <h3 class="info__h3">
          Records
        </h3>
        <div class="record--items">
          <div v-for="(record, index) in records" :key="`Record-${index}`" class="record--container">
            <div class="record--icon-visited">
              <span v-if="record.type === 'icon'" class="iconify" :data-icon="record.icon" width="20" height="20" />
              <span v-else class="summary--text-icon">{{ record.icon }}</span>
            </div> {{ record.content }}
          </div>
        </div>
      </div>

      <div class="info__sub--container">
        <h3 class="info__h3">
          Experience
        </h3>
        <div class="mb-2 experiences-list">
          <ExperienceItem v-for="(experience, index) in data.user.experiences" :key="`ExperienceItem-${index}`" :data="experience" />
          <p v-if="data.user.experiences && data.user.experiences.length === 0" class="info__p">
            No experiences to show yet
          </p>
        </div>
      </div>
    </div>

    <div class="info--right">
      <div v-if="$matchMedia.xl" class="flex-row space-between">
        <h3 class="info__h3 my-0">
          Share My Profile
        </h3>
        <div class="info__share--button" @click="copyToClipboard">
          <span class="iconify details__share--icon" data-icon="ic:round-link" />
          <span>{{ copyText }}</span>
        </div>
      </div>

      <div v-if="$matchMedia.xl" class="info__sub--container">
        <h3 class="info__h3">
          Records
        </h3>
        <div class="record--items">
          <div v-for="(record, index) in records" :key="`Record-${index}`" class="record--container">
            <div class="record--icon-visited">
              <span v-if="record.type === 'icon'" class="iconify" :data-icon="record.icon" width="24" height="24" />
              <span v-else class="summary--text-icon">{{ record.icon }}</span>
            </div>
            <span>{{ record.content }}</span>
          </div>
        </div>
      </div>

      <div class="info__sub--container">
        <h3 class="info__h3">
          Social Media
        </h3>

        <div v-if="$matchMedia.xl" class="social-media__container">
          <div v-for="(socmed, index) in socmeds" :key="`SocialMedia-${index}`" class="social-media__input-container">
            <a :href="socmed.link" class="social-media__a" target="_blank">
              <span class="iconify social-media__icon-visited" :data-icon="socmed.icon" />
            </a>
          </div>
          <p v-if="socmeds.length === 0" class="info__p">
            No social medias to show yet
          </p>
        </div>
        <div v-else class="social-media__container">
          <div v-for="socmed in socmeds" :key="`SocialMedia-${socmed.icon}`" class="social-media__input-container">
            <span class="iconify social-media__icon-visited" :data-icon="socmed.icon" />
            <a v-if="socmed.link !== ''" :href="socmed.link" class="social-media__a" target="_blank">
              <input type="text" class="social-media__input" :value="socmed.linkFiltered" disabled>
            </a>
            <input v-else type="text" class="social-media__input" value="-" disabled>
          </div>
        </div>
      </div>

      <div class="info__sub--container">
        <h3 class="info__h3">
          Curriculum Vitae
        </h3>
        <div v-if="data.user && data.user.cv">
          <p class="info__cv--container pointer">
            <Icon :icon="'bx-bxs-file-pdf'" :width="32" :height="32" />
            <a :href="data.user.cv" target="_blank" class="info__cv--heading link--clean">{{ user.first_name }} CV.pdf</a>
          </p>
        </div>
        <p v-else class="info__p">
          He/She has not upload the CV yet.
        </p>
      </div>

      <div v-if="!$matchMedia.xl" class="info__sub--container">
        <h3 class="last-sub--h3">
          Tag Name
        </h3>
        <p class="info__p tagname">
          <span class="iconify" data-icon="entypo:email" />
          <span>{{ data.user.tagname }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as timeago from 'timeago.js'
import ExperienceItem from '~/components/ExperienceItem'

export default {
  name: 'VisitedUserInfos',
  scrollToTop: false,

  components: { ExperienceItem },

  metaInfo () { return { title: `${this.data.user.full_name} - Info` } },

  data: () => ({
    copyText: 'Copy'
  }),

  computed: {
    socmeds () {
      const socmeds = [
        { 'icon': 'ant-design:behance-outlined',
          'link': this.data.user.behance ? this.data.user.behance : '',
          'linkFiltered': this.data.user.behance ? this.filterLink(this.data.user.behance) : '' },
        { 'icon': 'ant-design:github-filled',
          'link': this.data.user.github ? this.data.user.github : '',
          'linkFiltered': this.data.user.github ? this.filterLink(this.data.user.github) : '' },
        { 'icon': 'bx-bxl-linkedin',
          'link': this.data.user.linkedin ? this.data.user.linkedin : '',
          'linkFiltered': this.data.user.linkedin ? this.filterLink(this.data.user.linkedin) : '' },
        { 'icon': 'whh:dribbblealt',
          'link': this.data.user.dribbble ? this.data.user.dribbble : '',
          'linkFiltered': this.data.user.dribbble ? this.filterLink(this.data.user.dribbble) : '' },
        { 'icon': 'whh:website',
          'link': this.data.user.website ? this.data.user.website : '',
          'linkFiltered': this.data.user.website ? this.filterLink(this.data.user.website) : '' }
      ]

      if (this.$matchMedia.xl) return socmeds.filter(e => e.link !== '')

      return socmeds
    },

    theStudentHighestPoints () {
      if (this.data.user && this.data.user.leaderboards) {
        return Math.max(this.data.user.leaderboards.map(e => e.points))
      }

      return 0
    },

    level () {
      if (this.theStudentHighestPoints < 2501) return 'Rookie'
      else if (this.theStudentHighestPoints < 7501) return 'Amateur'
      else if (this.theStudentHighestPoints < 15001) return 'Superior'

      return 'Expert'
    },

    records () {
      if (this.data.user.role === 'Student') {
        return [
          { 'icon': 'bx:bxs-id-card', 'content': this.data.user.identity_number, 'type': 'icon' },
          { 'icon': 'Pts', 'content': `${this.theStudentHighestPoints} Points Collected`, 'type': 'not-icon' },
          { 'icon': 'LVL', 'content': this.level, 'type': 'not-icon' },
          { 'icon': 'fa-solid:building', 'content': `${this.data.user.faculty}, ${this.data.user.university}`, 'type': 'icon' },
          { 'icon': 'ic:baseline-card-membership', 'content': `Joined since ${timeago.format(this.data.user.joined_since)}`, 'type': 'icon' },
          { 'icon': 'icons8:finish-flag', 'content': `${this.data.user.finished_project_count} Finished Project`, 'type': 'icon' },
          { 'icon': 'entypo:squared-cross', 'content': '0 Failed Project', 'type': 'icon' }
        ]
      }

      return [
        { 'icon': 'bx:bxs-id-card', 'content': this.data.user.identity_number, 'type': 'icon' },
        { 'icon': 'fa-solid:building', 'content': `${this.data.user.faculty}, ${this.data.user.university}`, 'type': 'icon' },
        { 'icon': 'ic:baseline-card-membership', 'content': `Joined since ${timeago.format(this.data.user.joined_since)}`, 'type': 'icon' },
        { 'icon': 'dashicons-admin-post', 'content': `${this.data.projects ? this.data.projects.length : 0} Project Posted`, 'type': 'icon' },
        { 'icon': 'entypo:squared-cross', 'content': `0 Failed Project`, 'type': 'icon' }
      ]
    },

    ...mapGetters({
      data: 'visit/user',
      snackbar: 'notification/snackbar'
    })
  },

  methods: {
    filterLink (link) {
      const filter = link.split('//')
      return filter[filter.length - 1]
    },

    copyToClipboard () {
      const el = document.createElement('textarea')
      el.value = window.location.href
      el.setAttribute('readonly', '')
      el.style = { position: 'absolute', left: '-999.9rem' }
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)

      this.copyText = 'Copied'
      this.snackbar.open('User Profile link copied.')
    }
  }
}
</script>

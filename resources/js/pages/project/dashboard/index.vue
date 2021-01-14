<template>
  <div class="project-details--container">
    <div class="details--top-container">
      <div>
        <div class="project-details--image-container">
          <div class="project-details--image">
            <expandable-image
              :src="project.thumbnail_url"
              :close-on-background-click="true"
              class="details__image"
            />
          </div>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="details__top--left">
        <div class="z-1">
          <h1 class="project-details--h1 text-outline--thin">
            {{ project.title }}
          </h1>
          <p class="details__ongoing--p text-bold text-italic">
            On Going Project Since {{ startSince }}
          </p>
          <p class="details__ongoing--p">
            Please contact your lecturer for your further information about the
            project.
          </p>
        </div>
      </div>

      <div v-else class="mb-2_5">
        <h1 class="project-details--h1">
          {{ project.title }}
        </h1>
      </div>

      <div v-if="!$matchMedia.xl">
        <div>
          <h3 class="project-dashboard__h3">
            Project Participants
          </h3>
          <div class="project-dashboard__list-team">
            <div
              v-for="(e, index) in members"
              :key="`ProjectParticipant-${index}`"
              class="project-dashboard__list-team--item"
            >
              <router-link :to="{ path: '/@/' + e.member.tagname }">
                <img
                  :src="e.member.avatar"
                  alt=""
                  class="project-dashboard__list-team--img"
                >
              </router-link>

              <div class="">
                <p class="project-dashboard__list-team--name">
                  {{ e.member.full_name }}
                </p>
                <p class="project-dashboard__list-team--expertise">
                  {{ e.expertise }}
                </p>
              </div>
            </div>
          </div>
          <!-- <p class="details__ongoing--p text-bold text-italic">
            On Going Project Since {{ startSince }}
          </p> -->
          <p class="details__ongoing--p">
            Please contact your lecturer for your further information about the
            project.
          </p>
        </div>
      </div>
      <h2
        v-if="!$matchMedia.xl"
        id="project-details"
        v-scroll-to="'#project-details'"
        class="project-details--h2"
      >
        <a href="#project-details" class="button__project--more">
          <span class="iconify" data-icon="zmdi:more" />
          <span>Project Details</span>
        </a>
      </h2>
    </div>
    <hr v-if="$matchMedia.xl" class="form--hr">

    <div class="desktop-details__body">
      <div class="project-details--main-body">
        <div v-if="!$matchMedia.xl" class="project-details__lecturer-info">
          <div class="lecturer-info--left">
            <div class="lecturer-info--image-container mr-1">
              <router-link
                :to="{ path: '/@/' + project.user.tagname }"
                class="lencturer-text-link"
              >
                <img
                  :src="project.user.avatar"
                  :alt="`${project.user.full_name} Photo Profile`"
                >
              </router-link>
            </div>

            <div>
              <div><strong>Posted By</strong></div>
              <div>{{ project.user.full_name }}</div>
              <div>{{ project.user.identity_number }}</div>
              <div>{{ project.user.expertise }}</div>
            </div>
          </div>
          <div class="lecturer-info--right">
            <span
              class="iconify"
              data-icon="dashicons:share"
              width="30"
              height="30"
            />
          </div>
        </div>

        <div>
          <div v-if="$matchMedia.xl" class="mb-3">
            <h3 class="project-dashboard__h3 text-left">
              Project Participants
            </h3>
            <div class="project-dashboard__list-team flex-start">
              <div
                v-for="(e, index) in members"
                :key="`ProjectParticipant-${index}`"
                class="project-dashboard__list-team--item"
              >
                <router-link :to="{ path: '/@/' + e.member.tagname }">
                  <img
                    :src="e.member.avatar"
                    alt=""
                    class="project-dashboard__list-team--img"
                  >
                </router-link>

                <div class="">
                  <p class="project-dashboard__list-team--name">
                    {{ e.member.full_name }}
                  </p>
                  <p class="project-dashboard__list-team--expertise">
                    {{ e.expertise }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="project-description">
            <h3>Description</h3>
            <p>{{ project.description }}</p>
          </div>

          <div>
            <div class="project-requirements">
              <h3>Requirements</h3>
              <ul class="requirements--container">
                <li v-for="req in project.requirements" :key="req.id">
                  {{ req.requirement }}
                </li>
              </ul>
            </div>
            <div class="project-skills">
              <h3>Skills</h3>
              <div class="skills--container">
                <BubbleSkill
                  v-for="skill in project.skills"
                  :key="skill.id"
                  :color="bgBubble"
                  :name="skill.name"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-if="!$matchMedia.xl" class="project-summary">
          <h2 class="summary--h2">
            Summary Project
          </h2>
          <div class="summary--items">
            <div
              v-for="(summary, index) in summaries"
              :key="`SummaryItem-${index}`"
              class="summary--item"
            >
              <template v-if="summary.type === 'icon'">
                <div class="summary-icon">
                  <span
                    class="iconify"
                    :data-icon="summary.icon"
                    width="15"
                    height="15"
                  />
                </div>
                {{ summary.text }}
              </template>
              <template v-else>
                <div class="summary-icon">
                  <span class="summary--text-icon">{{ summary.icon }}</span>
                </div>
                {{ summary.text }}
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="desktop__body--right">
        <div v-if="$matchMedia.xl" class="lecturer-info--left">
          <div class="lecturer-info--image-container mr-1">
            <router-link
              :to="{ path: '/@/' + project.user.tagname }"
              class="lencturer-text-link"
            >
              <img
                :src="project.user.avatar"
                :alt="`${project.user.full_name} Photo Profile`"
              >
            </router-link>
          </div>

          <div class="details__poster--info">
            <p><strong>Posted By</strong></p>
            <p>{{ project.user.full_name }}</p>
            <p>NIP. {{ project.user.identity_number }}</p>
            <p>{{ project.user.expertise }}</p>
          </div>
        </div>
        <router-link
          :to="{ name: 'message', params: { tagname: project.user.tagname } }"
          class="btn btn--blue btn--large"
          tag="button"
          :disabled="isSelf"
        >
          Contact Lecturer
        </router-link>
        <div v-if="$matchMedia.xl" class="project-summary">
          <div class="details__share--container">
            <h2 class="">
              Share
            </h2>
            <div class="flex-row share__button--container">
              <div class="details__share--button" @click="copyToClipboard">
                <span
                  class="iconify details__share--icon"
                  data-icon="ic:round-link"
                />
                <span>{{ copyText }}</span>
              </div>
              <ShareNetwork
                v-for="network in networks"
                :key="network.network"
                :class="`details__share--button`"
                :network="network.network"
                :url="sharing.url"
                :title="sharing.title"
                :description="sharing.description"
              >
                <span
                  class="iconify details__share--icon"
                  :data-icon="network.icon"
                />
                <span>{{ network.name }}</span>
              </ShareNetwork>
            </div>
          </div>

          <div>
            <h2 class="summary--h2">
              Summary Project
            </h2>
            <div class="summary--items">
              <div
                v-for="(summary, index) in summaries"
                :key="`SummaryItem-${index}`"
                class="summary--item"
              >
                <template v-if="summary.type === 'icon'">
                  <div class="summary-icon">
                    <span
                      class="iconify"
                      :data-icon="summary.icon"
                      width="24"
                      height="24"
                    />
                  </div>
                  {{ summary.text }}
                </template>
                <template v-else>
                  <div class="summary-icon">
                    <span class="summary--text-icon">{{ summary.icon }}</span>
                  </div>
                  {{ summary.text }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as timeago from 'timeago.js'

export default {
  name: 'ProjectDashboard',
  middleware: ['auth'],

  metaInfo () {
    return { title: 'Project Dashboard' }
  },

  data: () => ({
    projects: null,
    bgBubble: 'blue',
    copyText: 'Copy',
    image: '/images/img-placeholder.png',
    networks: [
      { network: 'facebook', name: 'Facebook', icon: 'fa-brands:facebook-f' },
      { network: 'telegram', name: 'Telegram', icon: 'fa-brands:telegram-plane' },
      { network: 'twitter', name: 'Twitter', icon: 'fa-brands:twitter' },
      { network: 'line', name: 'Line', icon: 'fa-brands:line' },
      { network: 'whatsapp', name: 'Whatsapp', icon: 'fa-brands:whatsapp' }
      // { network: 'pinterest', name: 'Pinterest', icon: 'fa-brands:pinterest' },
    ]
  }),

  computed: {
    ...mapGetters({
      project: 'visit/project',
      user: 'auth/user'
    }),

    members () {
      if (this.project.project_team) return this.project.project_team.members
      return []
    },

    sharing () {
      return {
        url: window.location.href,
        title: this.project.title ? this.project.title : 'undefined',
        description: this.project.description
      }
    },

    startSince () {
      const date = new Date(this.project.start_time)
      let options = { year: 'numeric', month: 'long', day: 'numeric' }
      return date.toLocaleString('en-US', options)
    },

    summaries () {
      return [
        { type: 'icon', icon: 'bi:brush', text: `Expertise in ${this.expertiseIn}` },
        { type: 'icon', icon: 'fa-solid:dollar-sign', text: this.rewards },
        { type: 'icon', icon: 'ic:round-access-time', text: `Posted ${this.getHumanDate(this.project.created_at)}` },
        { type: 'icon', icon: 'ic:baseline-work', text: `${this.totalApplicants} Total Applicants` },
        { type: 'icon', icon: 'ant-design:star-filled', text: `Joining Project Grant up to ${this.grantMaximumPoints} Points` },
        { type: 'icon', icon: 'ic:round-supervisor-account', text: this.maxPerson },
        { type: 'text', icon: 'LVL', text: this.project.level_applicant },
        { type: 'text', icon: 'Pts', text: `Require Minimal ${this.minimumPoints} Points for each Person` }
      ]
    },

    grantMaximumPoints () {
      if (this.project.level_applicant === 'Easy') return 2000
      else if (this.project.level_applicant === 'Medium') return 2500
      else if (this.project.level_applicant === 'Hard') return 4000
      else if (this.project.level_applicant === 'Expert') return 5000
      else return 0
    },

    minimumPoints () {
      if (this.project.level_applicant === 'Easy') return 0
      else if (this.project.level_applicant === 'Medium') return 1500
      else if (this.project.level_applicant === 'Hard') return 4500
      else if (this.project.level_applicant === 'Expert') return 9000
      else return 0
    },

    expertiseIn () {
      let expertises = [
        { name: 'UI/UX Designer', isRequired: this.project.ui_ux_designer },
        { name: 'Frontend Engineer', isRequired: this.project.front_end_engineer },
        { name: 'Backend Engineer', isRequired: this.project.back_end_engineer },
        { name: 'Data Expert', isRequired: this.project.data_expert }
      ]
        .filter((expertise) => expertise.isRequired === true)
        .map((expertise) => expertise.name)
        .join(', ')

      return expertises
    },

    rewards () {
      if (this.project.salary) {
        const paymentType =
          this.project.payment_type === 'person'
            ? 'for each person'
            : 'for whole project'

        return `${new Intl.NumberFormat('id-ID').format(
          this.project.salary_amount
        )},- ${this.project.currency} ${paymentType} ${
          this.project.certificate ? `+ Certificate` : ''
        }`
      }

      return 'Certificate'
    },

    maxPerson () {
      const type = this.project.max_person === 1 ? 'Person' : 'Persons'
      return `Max. ${this.project.max_person} ${type} (${this.project.applicant_type})`
    },

    totalApplicants () {
      return this.project.individual_applicants_count
    },

    projectReview () {
      return {
        icon: 'whh:website',
        link: this.project.project_review.project_result
          ? this.project.project_review.project_result
          : '',
        linkFiltered: this.project.project_review.project_result
          ? this.filterLink(this.project.project_review.project_result)
          : ''
      }
    },

    isSelf () {
      if (this.user) return this.user.tagname === this.project.user.tagname

      return false
    }
  },

  mounted () {
    this.getDetails()
  },

  methods: {
    async getDetails () {
      await this.$store.dispatch('visit/fetchVisitedProject', {
        id: this.$route.params.id
      })
    },

    getHumanDate: function (date) {
      return timeago.format(date)
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
      this.snackbar.open('Project link copied')
    },

    filterLink (link) {
      if (link === '-') return null
      const filter = link.split('//')
      return filter[filter.length - 1]
    }
  }
}
</script>

<style>
</style>

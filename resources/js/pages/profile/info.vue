<template>
  <div class="info-container">
    <div>
      <h3>Bio</h3>
      <p>{{ user.biography }}</p>
    </div>

    <div class="info__sub--container">
      <h3>Skills</h3>
      <div class="info__skill-container">
        <BubbleSkill v-for="skill in skills" :key="skill.id" :color="bgBubble" :name="skill.skill" />
      </div>
    </div>

    <div v-if="user.role === 'Student'" class="info__sub--container">
      <h3>Badges</h3>
      <div class="info__skill-container">
        <BubbleSkill v-for="badge in badges" :key="badge.id" :color="bgBubble" :name="badge.name" />
      </div>
    </div>

    <div class="info__sub--container">
      <h3>Records</h3>
      <div class="record--items">
        <div v-for="record in records" :key="record.id" class="record--container">
          <div class="record--icon">
            <span v-if="record.type === 'icon'" class="iconify" :data-icon="record.icon" data-inline="true" width="20" height="20" />
            <span v-else class="summary--text-icon">{{ record.icon }}</span>
          </div> {{ record.content }}
        </div>
      </div>
    </div>

    <div class="info__sub--container">
      <h3>Experience</h3>
      <div class="experience__item">
        <img src="https://via.placeholder.com/50" alt="">
        <div class="experience__desc">
          <div class="experience__heading">
            Employee Monitoring Apps
          </div>
          <div class="experience__job">
            Frontend Engineer
          </div>
          <div class="experience__date">
            April 2019 - June 2019
          </div>
        </div>
      </div>
    </div>

    <div class="info__sub--container">
      <h3>Social Media</h3>
      <div class="social-media__container">
        <div v-for="socmed in socmeds" :key="socmed.id" class="social-media__input-container">
          <span class="iconify social-media__icon" :data-icon="socmed.icon" data-inline="true" />
          <template v-if="socmed.link !== ''">
            <a :href="socmed.link" class="social-media__a" target="_blank">
              <input type="text" class="social-media__input" :value="socmed.link" disabled>
            </a>
          </template>
          <template v-else>
            <input type="text" class="social-media__input" value="-" disabled>
          </template>
        </div>
      </div>
    </div>

    <div class="info__sub--container">
      <h3 class="last-sub--h3">
        Curriculum Vitae
      </h3>
      <p>You’re have not upload the CV yet.</p>
    </div>

    <div class="info__sub--container">
      <h3 class="last-sub--h3">
        TagName
      </h3>
      <p>@{{ user.tagname }}</p>
    </div>
  </div>
</template>

<script>
import BubbleSkill from '~/components/BubbleSkill'
import { mapGetters } from 'vuex'
import * as timeago from 'timeago.js'

export default {
  name: 'ProfileInfo',

  components: {
    BubbleSkill
  },

  metaInfo () {
    return { title: 'Profile Info' }
  },

  data: () => ({
    bgBubble: 'red',

    skills: [
      { 'id': 1, 'project_id': 1, 'skill': 'Communication' },
      { 'id': 2, 'project_id': 1, 'skill': 'Design Thinking' },
      { 'id': 3, 'project_id': 1, 'skill': 'Research' },
      { 'id': 4, 'project_id': 1, 'skill': 'Design' },
      { 'id': 5, 'project_id': 1, 'skill': 'Figma' },
      { 'id': 6, 'project_id': 1, 'skill': 'Adobe XD' }],

    badges: [
      { 'id': 1, 'project_id': 1, 'name': 'Top 5 Designer' },
      { 'id': 2, 'project_id': 1, 'name': 'Best Student Review' },
      { 'id': 3, 'project_id': 1, 'name': 'Painter Specialist' }
    ]
  }),

  computed: {
    socmeds () {
      return [
        { 'id': 1, 'icon': 'ant-design:behance-outlined', 'link': this.user.behance ? `http://${this.user.behance}` : '' },
        { 'id': 2, 'icon': 'ant-design:github-filled', 'link': this.user.github ? `http://${this.user.github}` : '' },
        { 'id': 3, 'icon': 'brandico:linkedin', 'link': this.user.linkedin ? `http://${this.user.linkedin}` : '' },
        { 'id': 4, 'icon': 'whh:dribbblealt', 'link': this.user.dribbble ? `http://${this.user.dribbble}` : '' },
        { 'id': 5, 'icon': 'whh:website', 'link': this.user.website ? `http://${this.user.website}` : '' }
      ]
    },

    ...mapGetters({
      user: 'auth/user'
    }),

    records () {
      if (this.user.role === 'Student') {
        return [
          { 'id': 1, 'icon': 'bx:bxs-id-card', 'content': this.user.identity_number, 'type': 'icon' },
          { 'id': 2, 'icon': 'Pts', 'content': '3500 Points Collected', 'type': 'not-icon' },
          { 'id': 3, 'icon': 'LVL', 'content': 'Superior Designer', 'type': 'not-icon' },
          { 'id': 4, 'icon': 'fa-solid:building', 'content': `${this.user.major}, ${this.user.university}`, 'type': 'icon' },
          { 'id': 5, 'icon': 'ic:baseline-card-membership', 'content': `Joined since ${timeago.format(this.user.joined_since)}`, 'type': 'icon' },
          { 'id': 6, 'icon': 'icons8:finish-flag', 'content': '3 Finished Project', 'type': 'icon' },
          { 'id': 7, 'icon': 'entypo:squared-cross', 'content': '1 Failed Project', 'type': 'icon' }
        ]
      }

      return [
        { 'id': 1, 'icon': 'bx:bxs-id-card', 'content': this.user.identity_number, 'type': 'icon' },
        { 'id': 4, 'icon': 'fa-solid:building', 'content': `${this.user.major}, ${this.user.university}`, 'type': 'icon' },
        { 'id': 5, 'icon': 'ic:baseline-card-membership', 'content': `Joined since ${timeago.format(this.user.joined_since)}`, 'type': 'icon' },
        { 'id': 6, 'icon': 'dashicons-admin-post', 'content': '3 Project Posted', 'type': 'icon' },
        { 'id': 7, 'icon': 'entypo:squared-cross', 'content': '1 Failed Project', 'type': 'icon' }
      ]
    }
  }
}
</script>

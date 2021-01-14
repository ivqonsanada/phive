<template>
  <form @submit.prevent="submitTeam" @keydown="form.onKeydown($event)">
    <div class="">
      <!-- Expertise Role -->
      <!-- <div class="form-group__container">
        <h4 class="form-group__input-name form__input-name">
          How many people are you?
        </h4>
        <div class="select">
          <select v-model="form.person" @change="checkMany">
            <option value="2">
              2 Person
            </option>
            <option value="3">
              3 Person
            </option>
          </select>
          <span class="focus" />
        </div>
      </div> -->

      <div v-for="(member, index) in form.team" :key="`TeamMember-${index}`">
        <!-- Expertise Role -->
        <div class="form-group__container">
          <h4 class="form-group__input-name form__input-name">
            {{ index === 0 ? 'Leader' : `Member ${index}` }} Expertise
          </h4>
          <div class="select">
            <select v-model="form.team[index].expertise">
              <option value="UI/UX Designer">
                UI / UX Designer
              </option>
              <option value="Frontend Engineer">
                Frontend Engineer
              </option>
              <option value="Backend Engineer">
                Backend Engineer
              </option>
              <option value="Data Expert">
                Data Expert
              </option>
            </select>
            <span class="focus" />
          </div>
        </div>

        <div class="form-group__container mb-5">
          <h4 class="form-group__input-name form__input-name">
            {{ index === 0 ? 'Leader' : `Member ${index}` }} Tag Name
          </h4>
          <div class=" form-tag__group">
            <input v-model="form.team[index].tagname" class="form-tag__input" disabled>
            <label class="form-tag"><span class="iconify" data-icon="entypo:email" /></label>
          </div>
        </div>
      </div>

      <hr class="form--hr">

      <!-- Tell me about yourself! -->
      <div class="form-group__container">
        <h4 class="form-group__input-name form__input-name">
          Tell me about your team!
        </h4>
        <div class=" form__input-name">
          <textarea v-model="form.self_describe" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <!-- Why you ? -->
      <div class="form-group__container">
        <h4 class="form-group__input-name form__input-name">
          Why the team interested in joining this project?
        </h4>
        <div class="">
          <textarea v-model="form.apply_reason" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <div class="">
        <!-- Submit Button -->
        <v-button :loading="form.busy" class="btn btn--blue btn--large apply__btn-submit">
          <span>
            Submit
          </span>
          <span class="iconify" data-icon="si-glyph:paper-plane" />
        </v-button>
      </div>
    </div>
  </form>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  name: 'ApplyTeamPage',

  middleware: ['auth', 'student'],

  metaInfo () { return { title: 'Apply - Team' } },

  data: () => ({
    form: new Form({
      applicant: 'Team',
      team: [],
      self_describe: '',
      apply_reason: ''
    })
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      members: 'auth/partyMembers',
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {
    if (!this.$route.params.title) {
      this.$router.push({ path: `/project/${this.$route.params.id}` })
    }

    this.form.team.push({ expertise: this.user.expertise, tagname: this.user.tagname, member_id: this.user.id })

    this.getParty()
  },

  methods: {

    addMember () {
      this.form.team.push({ expertise: '', tagname: '' })
    },

    async getParty () {
      await this.$store.dispatch('auth/fetchUserParty')

      let member = this.members.map(member => {
        return { expertise: member.expertise, tagname: member.member.tagname, member_id: member.member_id }
      })

      this.form.team.push(...member)
    },

    async submitTeam () {
      await this.form.post('/api' + this.$route.path)
        .then(({ data }) => {
          this.snackbar.open(data.message)
        })
        .then(e => {
          this.$router.push({ path: `/project/${this.$route.params.id}` })
        })
        .catch(e => {
          this.snackbar.open(e.response.data.message)
        })
    }

  }
}
</script>

<template>
  <div>
    <form @submit.prevent="saveProfile" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Expertise Role
          </h4>
          <div class="form-group__input-container">
            <select v-model="form.user.expertise" class="form-group__input-select"
                    placeholder="Select Expertise..."
            >
              <option value="UI/UX Designer">
                UI/UX Designer
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
          </div>
        </div>

        <div class="form-group__container">
          <div class="flex-row space-between">
            <h4 class="form-group__input-name post__h4">
              Skills
            </h4>
            <div class="flex-row unselectable post__add-skill pointer" @click="showAddSkill">
              <span class="iconify button__add-skill--icon mr-0_5" data-icon="ic:round-add-circle" data-inline="true" />
              <span class="button__add-skill--text">Add Skills</span>
            </div>
          </div>
          <div class="form-group__input-container">
            <div class="form-group__input-select info__skill-container">
              <p v-show="!form.user.skills">
                Add required skills to your project
              </p>
              <BubbleSkill v-for="skill in form.user.skills" :key="`skill-${skill.skill}`" color="red" :name="skill.skill" />
            </div>

            <modal ref="addSkillModal">
              <template v-slot:header>
                <div>
                  <h4 class="post__modal--h4 my-0">
                    Add Skills
                  </h4>
                </div>
              </template>

              <template v-slot:body>
                <div>
                  <hr class="my-0 mb-2_5">
                  <div>
                    <div class="form-group__input-container">
                      <input v-model="anotherSkills" class="form-group__input-text mb-0_5" placeholder="e.g., Communication, Laravel, VueJS">
                      <p>Separated by comma</p>
                      <p>You can add {{ 15 - skillLength }} more skills</p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer>
                <div class="btn btn--red" @click="addSkill">
                  Add Skills
                </div>
              </template>
            </modal>
          </div>
        </div>

        <hr class="form--hr">

        <h2 class="social-media__heading">
          Experience
        </h2>

        <div class="">
          <router-link :to="{ name: 'editprofile.page1' }" class="btn btn--grey mb-1_5" tag="button">
            Previous
          </router-link>

          <v-button :loading="form.busy" class="btn btn--red">
            Save Changes
          </v-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import BubbleSkill from '~/components/BubbleSkill'

export default {
  name: 'EditProfilePage2',

  components: {
    BubbleSkill
  },

  data: () => ({
    show: false,
    hide: false,

    showEditSkill: false,

    skills: [
      { 'id': 1, 'project_id': 1, 'skill': 'Communication' },
      { 'id': 2, 'project_id': 1, 'skill': 'Design Thinking' },
      { 'id': 3, 'project_id': 1, 'skill': 'Research' },
      { 'id': 4, 'project_id': 1, 'skill': 'Design' },
      { 'id': 5, 'project_id': 1, 'skill': 'Figma' },
      { 'id': 6, 'project_id': 1, 'skill': 'Adobe XD' }],

    form: new Form({
      user: {
        expertise: ''
      }
    }),

    anotherSkills: ''
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar'
    })

  },

  mounted: function () {
    this.getUser()
  },

  methods: {
    async showSkills () {
      this.toggleOverlay()
    },

    async getUser () {
      this.form.user = this.user
    },

    async saveProfile (e) {
      await this.form.post('/api/user/saveprofile/1')
        .then(({ data }) => {
          this.snackbar.open(data.message)
        })
    },

    async toggleOverlay () {
      if (this.show) {
        this.show = false
        this.hide = true
      } else {
        this.show = true
        this.hide = false
      }

      this.showEditSkill = !this.showEditSkill
    },

    async showAddSkill () {
      this.$refs.addSkillModal.openModal()
      this.skillLength = this.form.skills.length
    },

    async addSkill () {
      let anotherSkills = this.anotherSkills.split(',').map(skill => {
        return { skill: skill }
      })

      this.form.skills.push(...anotherSkills)
      this.$refs.addSkillModal.closeModal()
      this.anotherSkills = ''
    }
  }

}
</script>

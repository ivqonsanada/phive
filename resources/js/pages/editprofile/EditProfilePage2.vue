<template>
  <div>
    <form @submit.prevent="saveProfile" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Expertise Role
          </h4>
          <template v-if="user.role === 'Student'">
            <div class="select">
              <select v-model="form.user.expertise">
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
              <span class="focus" />
            </div>
          </template>
          <template v-else-if="user.role === 'Lecturer'">
            <div class="">
              <input v-model="form.user.expertise" class="form-group__input-text mb-0_5" placeholder="e.g., UI/UX Designer Specialist, Frontend Engineer Expert">
            </div>
          </template>
        </div>

        <div class="form-group__container">
          <div class="flex-row space-between">
            <h4 class="form-group__input-name">
              Skills
            </h4>
            <div class="flex-row unselectable post__add-skill pointer" @click="showAddSkill">
              <span class="iconify button__add-skill--icon mr-0_5" data-icon="ic:round-add-circle" />
              <span class="button__add-skill--text">Add Skills</span>
            </div>
          </div>
          <div class="">
            <div class="form-group__input-select info__skill-container">
              <p v-show="form.user.skills.length === 0" class="info__p">
                Show your true skills to the world
              </p>
              <BubbleSkill v-for="skill in form.user.skills" :key="`skill-${skill.name}`" color="blue" :name="skill.name" :deletable="true" @click="deleteSkill" />
            </div>

            <Modal ref="addSkillModal" :type="'small'">
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
                    <div class="">
                      <input v-model="anotherSkills" class="form-group__input-text mb-0_5" placeholder="e.g., Communication, Laravel, VueJS">
                      <p class="info__p">
                        Add multiple Skills separated by comma (<span class="iconify" data-icon="mdi:comma" width="12" height="12" />)
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer>
                <div class="btn btn--blue ml-auto" @click="addSkill">
                  Add Skills
                </div>
              </template>
            </Modal>
          </div>
        </div>

        <hr class="form--hr">

        <h2 class="social-media__heading">
          Experience
        </h2>

        <div class="form-group__container">
          <div class="flex-row space-between">
            <h4 class="form-group__input-name">
              Experience
            </h4>
          </div>
          <div class="">
            <div class="mb-1_5 experiences-list">
              <p v-show="form.user.experiences.length === 0" class="info__p">
                Add your experiences here
              </p>
              <ExperienceItem v-for="(experience, index) in form.user.experiences" :key="`ExperienceItem-${index}`" :data="experience" :index="index" :deletable="true" @click="deleteExperience" />
            </div>

            <div class="flex-center unselectable post__add-skill pointer" @click="showAddExperience">
              <span class="iconify button__add-skill--icon mr-0_5" data-icon="ic:round-add-circle" />
              <span class="button__add-skill--text">Add Experience</span>
            </div>

            <Modal ref="addExperienceModal" :type="'small'">
              <template v-slot:header>
                <h4 class="post__modal--h4 my-0">
                  Add Experience
                </h4>
              </template>

              <template v-slot:body>
                <div>
                  <hr class="my-0 mb-2_5">
                  <div class="form-group__container">
                    <h4 class="form-group__input-name post__h4">
                      Project Name
                    </h4>
                    <div class="">
                      <input v-model="anotherExperience.name" class="form-group__input-text mb-0_5" placeholder="e.g., PHive Web Apps" required>
                    </div>
                  </div>
                  <div class="form-group__container">
                    <h4 class="form-group__input-name post__h4">
                      Role
                    </h4>
                    <div class="">
                      <input v-model="anotherExperience.role" class="form-group__input-text mb-0_5" placeholder="e.g., UI/UX Designer, Frontend Engineer" required>
                    </div>
                  </div>
                  <div class="form-group__container">
                    <h4 class="form-group__input-name post__h4">
                      Start Date
                    </h4>
                    <div class="">
                      <month-picker v-model="anotherExperience.startDate" :no-default="true" :max-date="anotherExperience.endDate.from" :style="{ width: '100%' }" />
                    </div>
                  </div>
                  <div class="form-group__container">
                    <h4 class="form-group__input-name post__h4">
                      End Date
                    </h4>
                    <div class="">
                      <month-picker v-model="anotherExperience.endDate" :no-default="true" :min-date="anotherExperience.startDate.from" :style="{ width: '100%' }" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer>
                <div class="btn btn--blue ml-auto" @click="addExperience">
                  Add Experience
                </div>
              </template>
            </Modal>
          </div>
        </div>

        <div v-if="user.role === 'Student'" class="edit__hire--container mt-3">
          <span class="newcomer__hire--text">Are you open to be hired?</span>
          <div class="newcomer__hire--button-group">
            <div class="open-hire">
              <label class="open-hire__radio-container">
                <input v-model="form.user.is_open_hired" class="hide-radio" :value="true" type="radio">
                <span class="open-hire__radio">Yes</span>
              </label>
              <label class="open-hire__radio-container">
                <input v-model="form.user.is_open_hired" class="hide-radio" :value="false" type="radio">
                <span class="open-hire__radio">No</span>
              </label>
            </div>
          </div>
        </div>

        <label class="edit__cv--container pointer">
          <p class="edit__cv--heading">
            Upload CV Document
          </p>
          <p>File must be .pdf and the size must not more than 1MB </p>
          <input id="form2.file" class="form__input-file" name="form2.file" type="file" @change="uploadCV">
          <has-error :form="form2" field="file" />
        </label>

        <div class="mt-5 mb-1_5 edit-profile__buttons">
          <router-link :to="{ name: 'editprofile.page1' }" class="btn btn--grey " tag="button">
            Previous
          </router-link>

          <v-button :loading="form.busy" class="btn btn--blue">
            Save Changes
          </v-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { MonthPicker } from 'vue-month-picker'
import { mapGetters } from 'vuex'
import ExperienceItem from '~/components/ExperienceItem'
import { serialize } from 'object-to-formdata'

export default {
  name: 'EditProfile2Page',

  components: { MonthPicker, ExperienceItem },

  metaInfo () { return { title: 'Edit Profile Page 2' } },

  data: () => ({
    show: false,
    hide: false,
    showEditSkill: false,

    form: new Form({
      user: {
        expertise: '',
        is_open_hired: '',
        skills: [],
        experiences: []
      }
    }),
    form2: new Form({
      file: null
    }),

    anotherSkills: '',
    anotherExperience: {
      name: '',
      role: '',
      startDate: {
        from: new Date('Fri May 01 1990 00:00:00')
      },
      endDate: {
        from: new Date('Fri May 01 2050 00:00:00')
      }
    }
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar'
    })

  },

  mounted () {
    this.getUser()
  },

  methods: {
    async showSkills () {
      this.toggleOverlay()
    },

    async getUser () {
      this.form.user.expertise = this.user.expertise
      this.form.user.is_open_hired = this.user.is_open_hired
      this.form.user.skills = this.user.skills
      this.form.user.experiences = this.user.experiences
    },

    async saveProfile (e) {
      this.form.user.experiences = this.form.user.experiences.map(a => {
        return {
          project_name: a.project_name,
          project_role: a.project_role,
          start_date: new Date(a.start_date),
          end_date: new Date(a.end_date)
        }
      })

      await this.form.post('/api/user/saveprofile/2')
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('auth/updateUser', {
            user: data.user
          })
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
    },

    async addSkill () {
      let oldSkills = this.form.user.skills.map(skill => skill.name)
      oldSkills.push(...this.anotherSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''))

      let skillSet = new Set(oldSkills)

      if (skillSet.size > 20) {
        this.snackbar.open('Can\'t add more than 20 skills')
        return
      }

      let anotherSkills = [...skillSet].map(skill => {
        return { name: skill }
      })

      this.form.user.skills = anotherSkills
      this.$refs.addSkillModal.closeModal()
      this.anotherSkills = ''
    },

    async deleteSkill (e) {
      let abc = this.form.user.skills.filter(a => a.name !== e)
      this.form.user.skills = abc
    },

    async showAddExperience () {
      this.$refs.addExperienceModal.openModal()
    },

    async addExperience () {
      let experience = {
        project_name: this.anotherExperience.name,
        project_role: this.anotherExperience.role,
        start_date: this.anotherExperience.startDate.from,
        end_date: this.anotherExperience.endDate.from
      }

      this.form.user.experiences.push(experience)
      this.$refs.addExperienceModal.closeModal()
      this.anotherExperience = {
        name: '',
        role: '',
        startDate: {
          from: new Date('Fri May 01 1990 00:00:00')
        },
        endDate: {
          from: new Date('Fri May 01 2050 00:00:00')
        }
      }
    },

    deleteExperience (index) {
      this.form.user.experiences.splice(index, 1)
    },

    async uploadCV (e) {
      const file = e.target.files[0]

      // Do some client side validation...

      this.form2.file = file

      this.form2.submit('post', '/api/user/cv', {
        transformRequest: [function (data, headers) {
          return serialize(data)
        }]
      })
        .then(({ data }) => {
          this.$store.dispatch('auth/updateCV', {
            cv: data.cv
          })

          this.snackbar.open(data.message)
        })
        .catch(e => {
          this.snackbar.open(e.response.data.message)
        })
    },

    async deleteCV (e) {
      this.form.submit('delete', '/api/user/cv')
        .then(({ data }) => {
          this.$store.dispatch('auth/updateCV', {
            cv: null
          })

          this.snackbar.open(data.message)
        })
    }

  }
}
</script>

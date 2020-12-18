<template>
  <div>
    <div class="top-img__2--container">
      <div class="top-img__2--background">
        <router-link :to="{ name: 'index' }" class="login-link">
          <div class="top-img__2--logo" />
        </router-link>
      </div>
    </div>

    <h2 class="post__h1">
      Post Your Project!
    </h2>
    <div class="form-avatar-group__container">
      <img class="edit-profile--img" :src="form2.file ? form2.file : `/images/post-placeholder-img.png`" alt="">
      <div class="form-group__input-container form__file-container">
        <div>
          <label for="form2.avatar" class="btn btn--red">Upload Photo</label>
          <input id="form2.avatar" class="form__input-file" name="form2.file" type="file" @change="uploadImage">
        </div>
        <button class="btn btn--grey">
          Delete
        </button>
      </div>
    </div>

    <form @submit.prevent="postProject" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="form-group__container">
          <h4 class="form-group__input-name post__h4">
            Project Title
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.title" class="form-group__input-text" placeholder="Type your project title">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name post__h4">
            Location
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.location" class="form-group__input-text" placeholder="Type your location">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name post__h4">
            Expertise Role
          </h4>
          <div class="form-group__input-container checkbox-group">
            <label class="checkbox-container">UI / UX Designer
              <input v-model="form.ui_ux_designer" type="checkbox">
              <span class="checkbox-checkmark" />
            </label>
            <label class="checkbox-container">Frontend Engineer
              <input v-model="form.front_end_engineer" type="checkbox">
              <span class="checkbox-checkmark" />
            </label>
            <label class="checkbox-container">Backend Engineer
              <input v-model="form.back_end_engineer" type="checkbox">
              <span class="checkbox-checkmark" />
            </label>
            <label class="checkbox-container">Data Expert
              <input v-model="form.data_expert" type="checkbox">
              <span class="checkbox-checkmark" />
            </label>
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name post__h4">
            Quota
          </h4>
          <div class="select">
            <select v-model="form.max_person">
              <option value="1">
                1 Person
              </option>
              <option value="2">
                2 Persons
              </option>
              <option value="3">
                3 Persons
              </option>
              <option value="4">
                4 Persons
              </option>
              <option value="5">
                5 Persons
              </option>
              <option value="6">
                6 Persons
              </option>
              <option value="7">
                7 Persons
              </option>
              <option value="8">
                8 Persons
              </option>
              <option value="9">
                9 Persons
              </option>
            </select>
            <span class="focus" />
          </div>
        </div>
      </div>

      <div class="form-group__container">
        <h4 class="form-group__input-name post__h4">
          Applicant Type
        </h4>
        <div class="select">
          <select v-model="form.applicant_type">
            <option value="Individual">
              Individual
            </option>
            <option value="Team">
              Team
            </option>
            <option value="Individual & Team">
              Individual & Team
            </option>
          </select>
          <span class="focus" />
        </div>
      </div>

      <div class="form-group__container">
        <h4 class="form-group__input-name post__h4">
          Minimum points collected / person
        </h4>
        <div class="form-group__input-container">
          <input v-model="form.min_points" class="form-group__input-text" placeholder="Type the requirement project point">
        </div>
      </div>

      <div class="form-group__container">
        <h4 class="form-group__input-name post__h4">
          Level Applicant
        </h4>
        <div class="form-group__input-container radio-group">
          <label class="radio-container">Rooks
            <input v-model="form.level_applicant" class="radio-checkbox" value="Rooks" type="radio">
            <span class="radio-checkmark" />
          </label>
          <label class="radio-container">Superior
            <input v-model="form.level_applicant" class="radio-checkbox" value="Superior" type="radio">
            <span class="radio-checkmark" />
          </label>
          <label class="radio-container">Fleet
            <input v-model="form.level_applicant" class="radio-checkbox" value="Fleet" type="radio">
            <span class="radio-checkmark" />
          </label>
          <label class="radio-container">Demigod
            <input v-model="form.level_applicant" class="radio-checkbox" value="Demigod" type="radio">
            <span class="radio-checkmark" />
          </label>
        </div>
      </div>

      <hr class="form--hr">

      <div class="form-group__container">
        <h4 class="form-group__input-name post__h4">
          Project Description
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.description" class="form-group__input-textarea" placeholder="Max. 500 words" rows="5" />
        </div>
      </div>

      <div class="form-group__container">
        <div class="flex-row space-between">
          <h4 class="form-group__input-name post__h4">
            Requirements
          </h4>
        </div>
        <div class="form-group__input-container">
          <RequirementList :data="form.requirements" />

          <div class="flex-center unselectable post__add-skill pointer" @click="showAddRequirement">
            <span class="iconify button__add-skill--icon mr-0_5" data-icon="ic:round-add-circle" data-inline="true" />
            <span class="button__add-skill--text">Add Requirement</span>
          </div>

          <modal ref="addRequirementModal">
            <template v-slot:header>
              <h4 class="post__modal--h4 my-0">
                Add Requirements
              </h4>
            </template>

            <template v-slot:body>
              <div>
                <hr class="my-0 mb-2_5">
                <div class="form-group__input-container">
                  <textarea v-model="form.description" class="form-group__input-textarea" placeholder="Max. 500 words" rows="5" />
                  <p>Separated by dot</p>
                </div>
              </div>
            </template>

            <template v-slot:footer>
              <div class="btn btn--red" @click="addSkill">
                Add Requirements
              </div>
            </template>
          </modal>
        </div>
      </div>

      <div class="form-group__container">
        <div class="flex-row space-between">
          <h4 class="form-group__input-name post__h4">
            Skills Required
          </h4>
          <div class="flex-row unselectable post__add-skill pointer" @click="showAddSkill">
            <span class="iconify button__add-skill--icon mr-0_5" data-icon="ic:round-add-circle" data-inline="true" />
            <span class="button__add-skill--text">Add Skills</span>
          </div>
        </div>
        <div class="form-group__input-container">
          <div class="form-group__input-select info__skill-container">
            <p v-show="!form.skills">
              Add required skills to your project
            </p>
            <BubbleSkill v-for="skill in form.skills" :key="`skill-${skill.skill}`" color="red" :name="skill.skill" />
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

      <div class="form-group__container">
        <h4 class="form-group__input-name post__h4">
          Rewards
        </h4>
        <div class="form-group__input-container checkbox-group">
          <label class="checkbox-container">Salary
            <input v-model="form.salary" type="checkbox">
            <span class="checkbox-checkmark" />
          </label>
          <label class="checkbox-container">Certificate
            <input v-model="form.certificate" type="checkbox">
            <span class="checkbox-checkmark" />
          </label>
        </div>
      </div>

      <div class="">
        <!-- Submit Button -->
        <div class="btn btn--large btn--grey mb-1_5" @click="postProject('save as draft')">
          Save as Draft
        </div>
        <v-button :loading="form.busy" class="btn btn--large btn--red">
          Post Project
        </v-button>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { serialize } from 'object-to-formdata'
import { mapGetters } from 'vuex'
import RequirementList from '~/components/RequirementList'

export default {
  name: 'PostProject',

  middleware: ['auth'],

  components: {
    RequirementList
  },

  data: () => ({
    form: new Form({
      title: '',
      location: 'Malang, Indonesia',
      level_applicant: '',
      max_person: 4,
      ui_ux_designer: false,
      front_end_engineer: false,
      back_end_engineer: false,
      data_expert: false,
      applicant_type: 'Individual & Team',
      description: '',
      interest: '',
      min_points: '',
      skills: [
        { 'skill': 'Communication' },
        { 'skill': 'Design Thinking' },
        { 'skill': 'Research' },
        { 'skill': 'Design' },
        { 'skill': 'Figma' },
        { 'skill': 'Adobe XD' }
      ],
      requirements: [
        { 'requirement': 'Specific technical skills or languages are not required but strong designing skills and hunger to learn are. Out-of-school experiences like winning contests, prior internships, open source contribution etc. will make your application stand out. ' }
      ]
    }),

    form2: new Form({
      file: null
    }),

    skillLength: 0,
    anotherSkills: '',
    anotherRequirements: ''
  }),

  metaInfo () {
    return { title: 'Post Project' }
  },

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {

  },

  methods: {

    async uploadImage (e) {
      const file = e.target.files[0]

      // Do some client side validation...

      this.form2.file = file

      this.form2.submit('post', '/api/project/image', {
        transformRequest: [function (data, headers) {
          return serialize(data)
        }]
      })
        .then(({ data }) => {
          this.$store.dispatch('auth/updateAvatar', {
            avatar: data.avatar
          })

          this.snackbar.open(data.message)
        })
    },

    async showAddSkill () {
      this.$refs.addSkillModal.openModal()
      this.skillLength = this.form.skills.length
    },

    async showAddRequirement () {
      this.$refs.addRequirementModal.openModal()
    },

    async addSkill () {
      let anotherSkills = this.anotherSkills.split(',').map(skill => {
        return { skill: skill }
      })

      this.form.skills.push(...anotherSkills)
      this.$refs.addSkillModal.closeModal()
      this.anotherSkills = ''
    },

    async addRequirement () {
      let anotherRequirements = this.anotherRequirements.split('.').map(requirement => {
        return { requirement: requirement }
      })

      this.form.requirements.push(...anotherRequirements)
      this.$refs.addRequirementModal.closeModal()
      this.anotherRequirements = ''
    },

    async postProject (status) {
      if (!status) this.form.status = 'Published'
      else this.form.status = 'Draft'

      this.form.submit('post', '/api/project/post')
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$router.push({ name: 'projectbox' })
        })
    }
  }
}
</script>

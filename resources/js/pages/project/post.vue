<template>
  <div>
    <h2 class="post__h1">
      Post Your Project!
    </h2>
    <form @submit.prevent="image_post" @keydown="form.onKeydown($event)">
      he
    </form>
    <form @submit.prevent="post" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Project Title
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.tagname" class="form-group__input-text" placeholder="Type your project title">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Location
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.tagname" class="form-group__input-text" placeholder="Type your location">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Expertise Role
          </h4>
          <div class="form-group__input-container">
            <checkbox v-model="remember" name="remember" class="input-remember">
              UI / UX Designer
            </checkbox>
            <checkbox v-model="remember" name="remember" class="input-remember">
              Frontend Engineer
            </checkbox>
            <checkbox v-model="remember" name="remember" class="input-remember">
              Backend Engineer
            </checkbox>
            <checkbox v-model="remember" name="remember" class="input-remember">
              Data Expert
            </checkbox>
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Quota
          </h4>
          <div class="form-group__input-container">
            <select v-model="form.quota" class="form-group__input-select"
                    placeholder="Select project quota"
            >
              <option value="select" disabled>
                Select project quota
              </option>
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
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Applicant Type
          </h4>
          <div class="form-group__input-container">
            <select v-model="form.apply_type" class="form-group__input-select"
                    placeholder="Select Expertise..."
            >
              <option value="Team and Individual">
                Team & Individual
              </option>
              <option value="Frontend Engineer">
                Team Only
              </option>
              <option value="Backend Engineer">
                Individual Only
              </option>
            </select>
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Minimum points collected / Person
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.tagname" class="form-group__input-text" placeholder="Type the requirement project point">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Level Applicant
          </h4>
          <div class="form-group__input-container">
            <div>
              <input id="" type="radio" name="">
              <label for="">Rooks</label>
            </div>
            <div>
              <input id="" type="radio" name="">
              <label for="">Superior</label>
            </div>
            <div>
              <input id="" type="radio" name="">
              <label for="">Fleet</label>
            </div>
            <div>
              <input id="" type="radio" name="">
              <label for="">Demigod</label>
            </div>
          </div>
        </div>

        <hr class="form--hr">

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Project Requirements
          </h4>
          <div class="form-group__input-container">
            <textarea v-model="form.interest" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Requirement Skills
          </h4>
          <div class="form-group__input-container">
            <textarea v-model="form.interest" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Rewards
          </h4>
          <div class="form-group__input-container">
            <checkbox v-model="remember" name="remember" class="input-remember">
              Salary
            </checkbox>
            <checkbox v-model="remember" name="remember" class="input-remember">
              Certificate
            </checkbox>
          </div>
        </div>

        <div class="">
          <!-- Submit Button -->
          <v-button :loading="form.busy" class="form__submit-button">
            Post Project
          </v-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'

export default {
  middleware: 'auth',

  data: () => ({

    form: new Form({
      applicant: '',
      expertise: '',
      quota: 'select',
      tagname: '',
      apply_type: 'Team and Individual',
      description: '',
      interest: ''
    })
  }),

  metaInfo () {
    return { title: 'Post Project' }
  },

  mounted () {

  },

  methods: {
    async post () {
      await this.form.post('/api/project/')

      this.form.reset()
    }
  }
}
</script>

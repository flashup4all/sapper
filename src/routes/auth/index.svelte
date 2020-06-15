<script>

  // import { goto, url } from "@sveltech/routify";
  import { goto } from '@sapper/app';
  import { axiosInstance } from '../../interceptor/index.js'
  import { store_token, store_user, get_token, store_vendor } from '../../localstore'
  import { onMount } from 'svelte'
  import toastr from "toastr";

	let auth_form = { email: "", password: "" }
  // let form_error = false;
	onMount(() => {
     if(get_token()){
        goto("/app")
      }
	})

  $: checkValid = (auth_form.email && auth_form.password )

  function authenticate(auth_form)
  {
    axiosInstance.post(`/auth/login`, auth_form)
        .then(response => {
          if(response.status === 200)
          {
            if(response.data.status === "success")
            {
              toastr.success(response.data.message, " Authentication Successful")
              const data = response.data
              store_token(data.token)
              store_user(data.user)
              store_vendor(data.vendor)
              goto("/app");
              
              setTimeout(() => {
                location.reload();
              }, 1000);
              return;
            }
            if(response.data.status === "error")
            {
              toastr.error(response.data.message, "Authentication Error")
              return;
            }
            
            
          }
          toastr.error("Validation Error", "Authentication Error")
          return;
        })
        .catch(error => {
            //this.loader.hide()
        });
  }
</script>

<div class="container h-100">
      <div class="row h-100 justify-content-center align-items-center">
        <div class="col-md-6">
          <div class="card-group">
            <div class="card p-4">
              <div class="card-body">
                <form>
                  <h1>Login</h1><a href="/example">/example</a>
                  <p class="text-muted">Sign In to your account</p>
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text"><i class="pe-7s-user"></i></span>
                    </div>
                    <input type="email" class="form-control" bind:value={auth_form.email} placeholder="email" required>
                  </div>
                   <!-- <small class="form-error" >Email is required</small> -->
                  <div class="input-group mb-4">
                    <div class="input-group-prepend">
                      <span class="input-group-text"><i class="pe-7s-lock"></i></span>
                    </div>
                    <input type="password" bind:value={auth_form.password}  class="form-control" placeholder="Password" autocomplete="current-password" required>
                  </div>
                  <!-- <small class="form-error">Password is required</small> -->
                  <div class="row">
                    <div class="col-6">
                      <button type="button" on:click={() => authenticate(auth_form)} disabled={!checkValid} class="btn btn-primary px-4">Login</button>
                    </div>
                    <div class="col-6 text-right">
                      <button type="button" class="btn btn-link px-0">Forgot password?</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <!-- <div class="card text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <div class="card-body text-center">
                <div>
                  <h2>Sign up</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <button type="button" class="btn btn-primary active mt-3">Register Now!</button>
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>
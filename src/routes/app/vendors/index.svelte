<script>
	import { onMount } from 'svelte'
    import { goto, url } from "@sveltech/routify";
    import { environment } from '../../../environments';

    import toastr from "toastr";
    import swal from 'sweetalert';
    import { axiosInstance } from '../../../interceptor/index.js'
    import { FILTER_NAME_QUERY } from '../_utils/format/general.js'
    import { get_user, get_token } from '../../../localstore'
    import PageHeader from "../_components/PageHeader.svelte";
    import Loader from "../_utils/loader.svelte";
    import Empty from "../_utils/empty.svelte";
    import Pagination from "../_utils/pagination.svelte";



    const img_host = environment.img_host;
    const default_img = environment.default_img;
    let auth_form = { email: "", password: "" }
    let user = get_user();
    $: vendors = [];
    $: sorted = [];
    
    // let page = 0;
    $: loader = false;
    $: form_loader = false;

    $: last_page = null;
    $: current_page = null;

    let vendor_types = [];
    $: query = '';
    $: queryArray = [];
    $: sort_option = '';
    let statuses = [{ name: "Active", value: "Active" }, { name: "inactive", value: "Inactive"}]
    let options = [{
        value: 'saturday',
        name: 'Saturdays'
      }, {
        value: 'sunday',
        name: 'Sundays'
      }
      ];
    let current_vendor
    $: show_filter = false;
    $: is_filter = false
    let container;
    let google_autocomplete;
    let geocoder;
    let bounds = null;
    let vendor_stats = {};
    let files;
    let create_preview;
	onMount(() => {
        google_autocomplete = new google.maps.places.AutocompleteService();
        geocoder = new google.maps.Geocoder();
        get_vendors(0)
        //get vendor stats
        axiosInstance.get(`/admin/vendor/totals`)
        .then(response => {
            vendor_stats = response.data.data;
            
        })
        .catch(error => {
            //this.loader.hide()
        });

        //get vendor types
        axiosInstance.get(`/vendor-types`)
        .then(response => {
            vendor_types = response.data.data;
            vendor_types = vendor_types.filter(vendor_type => vendor_type.name != "Logistics")
        })
        .catch(error => {
            //this.loader.hide()
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(data) {
                let position = {
                    lat: data.coords.latitude,
                    lng: data.coords.longitude
                };
                let centerSfo = new google.maps.LatLng(position.lat, position.lng);
                let circle = new google.maps.Circle({radius: 500, center: centerSfo});
                bounds = circle.getBounds();
            // Create a new map and place a marker at the device location.
        
            });
        } 
        else {
        // geolocation is not supported
        }
	})

    let mode = 0;
    let vendor_form = {}
    $: query_address = "";
    let filter_form = {}
    let form_action = "Create"
    $: checkValid = (vendor_form.email && vendor_form.name && vendor_form.status && vendor_form.vendor_type_id 
                        && vendor_form.mobile_no  && vendor_form.address  );
    $: chech_valid_filter_form = (filter_form.from || filter_form.to || filter_form.vendor_type_id);
    
    $: autocomplete_items = [];
    $: if(query_address)
    {
        google_autocomplete.getPlacePredictions(
        { input: query_address, 
            componentRestrictions: {country: 'ng'}, 
            bounds:bounds
        },
        (predictions, status) => {
        autocomplete_items = [];
            console.log(predictions)
            autocomplete_items = predictions;
           
        });
    }
    let set_selected_address = (item) => {
        vendor_form.address = item.description
        query_address = item.description
        autocomplete_items = [];
            geocoder.geocode({'placeId': item.place_id}, (results, status) => {
            if(status === 'OK' && results[0]){
                vendor_form.lat = results[0].geometry.location.lat();
                vendor_form.lng = results[0].geometry.location.lng();
            }
        })
    }
    function get_vendors(page = 0)
    {
        loader = true;
        is_filter = false;
        axiosInstance.get(`/vendor?page=${page}`)
        .then(response => {
            vendors = response.data.data.data;
             vendors.map((vendor) => {
                vendor.logo_url = vendor.logo !== null ? `${img_host}/vendor/`+vendor.logo.name : `${default_img}`;
              })
            sorted = [...vendors]
            last_page = response.data.data.last_page
            current_page = response.data.data.current_page;

            loader = false;
        })
        .catch(error => {
           loader = false; //this.loader.hide()
        });
    }
    function set_mode(index){
        mode = index;
        form_action = "Create"
        current_vendor = null

    }

    

    function reset()
    {
        mode = 0;
        vendor_form = {}
        current_vendor = null
    }

    function spawn_edit(obj){
        console.log(obj)
        form_action = "Update"
        current_vendor = obj
        vendor_form = obj
        create_preview = obj.logo_url
        query_address = obj.address
        mode = 1
    }

    function show_filter_form()
    {
        show_filter = !show_filter
    }
    $: if (query) {
        queryArray = FILTER_NAME_QUERY(vendors, query);
    }
  
    // const val = e.srcElement.value;
    
    $: switch (sort_option) {
        case '':
            sorted = [...vendors];
            queryArray = query ? FILTER_NAME_QUERY(sorted, query) : queryArray;
            break;

        default:
            sorted = [...vendors];
            sorted = sorted.filter(s => s.status === sort_option);
            queryArray = query ? FILTER_NAME_QUERY(sorted, query) : queryArray;
            break;
    }
    
    function createAction(vendor_form)
    {
        let formData = new FormData();
        formData.append('vendor_type_id', vendor_form.vendor_type_id);
        formData.append('name', vendor_form.name);
        formData.append('email', vendor_form.email);
        formData.append('address', vendor_form.address);
        formData.append('lat', vendor_form.lat);
        formData.append('lng', vendor_form.lng);
        formData.append('mobile_no', vendor_form.mobile_no);
        formData.append('description', vendor_form.description ? vendor_form.description : '');
        formData.append('status', vendor_form.status ? vendor_form.status : 1);

        if(current_vendor)
        {
            form_loader = true;
            formData.append('id', current_vendor.id);
            if(files && files[0])
            {
                for( var i = 0; i < files.length; i++ ){
                    let file = files[i];

                    formData.append('logo[' + i + ']', file);
                }
            }
            axiosInstance.post(`/vendor/update`, formData)
                .then(response => {
                    if(response.data.status == 'success')
                    {
                        form_loader = false;
                        vendors.splice(vendors.findIndex(s => s.id === vendor_form.id), 1, vendor_form);
                        toastr.success(response.data.message, "Successful")
                        reset()
                    }
                    else{
                        toastr.error(response.data.message, "Error!")
                    }
                }).catch(error => {
                    form_loader = false;
                // $('#bootstrap').modal('hide');
            })

        }else{
            form_loader = true;
            axiosInstance.post(`/vendor/create`, formData)
                .then(response => {
                    if(response.data.status == 'success')
                    {
                        form_loader = false;
                        vendors.push(response.data.data);
                        sorted = [...vendors];
                        toastr.success(response.data.message, "Successful")
                        reset()
                    }
                    else{
                        toastr.error(response.data.message, "Error!")
                    }
                }).catch(error => {
                    form_loader = false;
                // $('#bootstrap').modal('hide');
            })
        }
    }
    function handle_pagination(event)
    {
        get_vendors(event.detail.current_page)
    }

    function filter()
    {
        is_filter = true
        loader = true;
        console.log(filter_form)
        axiosInstance.post(`/vendor/filter`, filter_form)
            .then(response => {
                let res = response.data
                if(res.status == 'success')
                {
                    loader = false;
                    vendors = res.data
                    sorted = [...vendors]
                    console.log(sorted)
                    reset()
                }
                else{
                
                }
            }).catch(error => {
                form_loader = false;
            // $('#bootstrap').modal('hide');
        })
    }
    function spawn_delete(id)
    {
        swal({
            title: "Are you sure?",
            text: "this action cannot be undone!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            })
            .then((willDelete) => {
            if (willDelete) {
                axiosInstance.get(`/vendor/delete/${id}`)
                .then(response => {
                    let res = response.data
                    if(res.status == 'success')
                    {
                        vendors.splice(vendors.findIndex(s => s.id === id), 1);
                        sorted = [...vendors]
                        swal(res.message, {
                        icon: "success",
                        });
                    }
                    else{
                    
                    }
                }).catch(error => {
                    form_loader = false;
                // $('#bootstrap').modal('hide');
                })  
            } else {
                swal("Your imaginary file is safe!");
            }
            });
    }

    function export_filter(type, fn, dl)
    {
        toastr.error('Are you the 6 fingered man?','hello')

    }

    function print_filter()
    {

    }
    
     function preview()
    {
        if(files && files[0])
        {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = (_event) => {
            const image = new Image();
            image.src = String(reader.result);
            //   const context = this;
            image.onload = function() {
                const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
                if (height < 180 || weight < 180) {
                toastr.error('Image aspect ratio should be at least 180 x 180');
                return false;
                } else {
                create_preview = reader.result;
                }
            };
            };
        }
        
    }
</script>
<svelte:head>
</svelte:head>
<div>
    <PageHeader title="Vendors" subtitle="Manage all Vendors" />

<div class="full-screen" bind:this={container}></div>
    <div class="row">
        <div class="col-lg-6 col-xl-4">
            <div class="card mb-3 widget-content">
                <div class="widget-content-wrapper">
                    <div class="widget-content-left">
                        <div class="widget-heading">Vendors</div>
                        <div class="widget-subheading">Total</div>
                    </div>
                    <div class="widget-content-right">
                        <div class="widget-numbers text-success"><span>{ vendor_stats.total || 0 }</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-xl-4">
            <div class="card mb-3 widget-content">
                <div class="widget-content-wrapper">
                    <div class="widget-content-left">
                        <div class="widget-heading">Active</div>
                        <div class="widget-subheading">Total</div>
                    </div>
                    <div class="widget-content-right">
                        <div class="widget-numbers text-primary"><span>{ vendor_stats.active || 0 }</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-xl-4">
            <div class="card mb-3 widget-content">
                <div class="widget-content-wrapper">
                    <div class="widget-content-left">
                        <div class="widget-heading">Inactive</div>
                        <div class="widget-subheading">Total</div>
                    </div>
                    <div class="widget-content-right">
                        <div class="widget-numbers text-warning"><span>{ vendor_stats.pending || 0 }</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        {#if mode === 0}  
        <div class="col-md-12">
            <div class="main-card mb-3 card">
                <!-- <div>
                    <button class="btn btn-primary btn-sm float-right ml-2"   on:click={() => show_filter_form()}>
                        <i class="fa fa-filter mr-1"></i>
                    </button>
                </div> -->
                
                <div class="card-header">
                    Sort by
                    <div class="ml-3 mr-3">
                        <input  type="text"  bind:value={query} class="form-control form-control-sm"  placeholder="Search...">
                    </div>
                    <div>
                        <select bind:value={sort_option} class="form-control form-control-sm">
                            <option value="" selected>All statuses</option>
                            {#each statuses as status, i}
                                <option value={status.value} >{status.name}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="btn-actions-pane-right">
                        <button class="btn btn-primary btn-sm float-right ml-2"   on:click={() => show_filter_form()}>
                            <i class="fa fa-filter mr-1"></i>
                        </button>
                        <button class="btn btn-primary btn-sm float-right" on:click={() => set_mode(1)}>
                            <i class="fa fa-plus mr-1"></i>
                            New Vendor
                        </button>
                    </div>
                </div>
                {#if show_filter}
                    <div class="card-header">
                        Filter | Query
                        <div class="ml-3 mr-3">
                            <div class="input-group">
                                <input  type="date"  bind:value={filter_form.from} class="form-control form-control-sm"  placeholder="Search...">
                                <input  type="date"  bind:value={filter_form.to} class="form-control form-control-sm"  placeholder="Search...">
                            </div>
                        </div>
                        <div>
                            <select bind:value={filter_form.vendor_type_id} class="form-control form-control-sm">
                                <option value="" selected>Account Type</option>
                                {#each vendor_types as type, i}
                                    <option value={type.id} >{type.name}</option>
                                {/each}
                            </select>
                        </div>
                            <button class="btn btn-primary btn-sm ml-2 float-right" disabled={!chech_valid_filter_form} on:click={() => filter() }>
                                <i class="fa fa-search mr-1"></i>
                                Search
                            </button>
                            <!-- <button class="btn btn-outline-success btn-sm ml-2 float-right"  on:click={() => export_filter()}>
                                <i class="fa fa-search mr-1"></i>
                                Export
                            </button> -->
                    </div>
                {/if}
                <div>
                {#if !query && sorted.length}
                <div class="table-responsive">
                 <!-- {#if is_filter && sorted && sorted.length}
                    <div>
                        <button class="btn btn-primary btn-sm float-right ml-2"   on:click={() => print_filter()}>
                            <i class="fa fa-filter mr-1"></i>
                            Print
                        </button>
                        <button class="btn btn-success btn-sm ml-2 float-right"  on:click={() => export_filter('exportable_table')}>
                            <i class="fa fa-search mr-1"></i>
                            Export
                        </button>
                    </div>
                 {/if} -->
                    <table class="align-middle mb-0 table table-borderless table-striped table-hover" id="exportable_table">
                        <thead>
                        <tr>
                            <th class="text-center">#</th>
                            <th>Name</th>
                            <th class="text-center">Type</th>
                            <th class="text-center">Status</th>
                            <th class="text-center">Created</th>
                            <th class="text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each sorted as vendor, i}
                        <tr>
                            <td class="text-center text-muted">{i + 1}</td>
                            <td>
                                <div class="widget-content p-0">
                                    <div class="widget-content-wrapper">
                                        <div class="widget-content-left mr-3">
                                            <div class="widget-content-left">
                                                <img width="40" class="rounded-circle" src={vendor.logo_url} alt="">
                                            </div>
                                        </div>
                                        <div class="widget-content-left flex2">
                                            <div class="widget-heading">{vendor.name }</div>
                                            <div class="widget-subheading opacity-7">{ vendor.address}</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-center"> { vendor.vendor_type ? vendor.vendor_type.name : "" }</td>
                            <td class="text-center">
                                {#if vendor.status === 'Active'}
                                <div class="badge badge-success">{ vendor.status }</div>
                                {/if}
                                {#if vendor.status === 'Pending' || vendor.status === 'pending'}
                                <div class="badge badge-warning">{ vendor.status }</div>
                                {/if}
                                {#if vendor.status === 'Cancelled' || vendor.status === "Suspended"}
                                <div class="badge badge-danger">{ vendor.status }</div>
                                {/if}
                            </td>
                            <td class="text-center">
                                <div class="">{ vendor.created_at || " " }</div>
                            </td>
                            <td class="text-center">
                                <button type="button" id="PopoverCustomT-1" class="btn btn-outline-primary btn-sm" on:click={() => spawn_edit(vendor)}>Edit</button>
                                <!-- <button type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm">Details</button> -->
                                <button type="button" id="PopoverCustomT-1" on:click={() => spawn_delete(vendor.id)} class="btn btn-danger btn-sm">Delete</button>
                            </td>
                        </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>
                {/if}
                {#if query && queryArray.length}
                <div class="table-responsive">
                    <table class="align-middle mb-0 table table-borderless table-striped table-hover">
                        <thead>
                        <tr>
                            <th class="text-center">#</th>
                            <th>Name</th>
                            <th class="text-center">Type</th>
                            <th class="text-center">Status</th>
                            <th class="text-center">Created</th>
                            <th class="text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each queryArray as vendor, i}
                        <tr>
                            <td class="text-center text-muted">{i + 1}</td>
                            <td>
                                <div class="widget-content p-0">
                                    <div class="widget-content-wrapper">
                                        <div class="widget-content-left mr-3">
                                            <div class="widget-content-left">
                                                <img width="40" class="rounded-circle" src={vendor.logo_url} alt="">
                                            </div>
                                        </div>
                                        <div class="widget-content-left flex2">
                                            <div class="widget-heading">{vendor.name }</div>
                                            <div class="widget-subheading opacity-7">{ vendor.address}</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-center"> { vendor.vendor_type ? vendor.vendor_type.name : "" }</td>
                            <td class="text-center">
                                {#if vendor.status === 'Active'}
                                <div class="badge badge-success">{ vendor.status }</div>
                                {/if}
                                {#if vendor.status === 'Pending' || vendor.status === 'pending'}
                                <div class="badge badge-warning">{ vendor.status }</div>
                                {/if}
                                {#if vendor.status === 'Cancelled' || vendor.status === "Suspended"}
                                <div class="badge badge-danger">{ vendor.status }</div>
                                {/if}
                            </td>
                            <td class="text-center">
                                <div class="">{ vendor.created_at || " " }</div>
                            </td>
                            <td class="text-center">
                                <button type="button" id="PopoverCustomT-1" class="btn btn-outline-primary btn-sm" on:click={() => spawn_edit(vendor)}>Edit</button>
                                <button type="button" id="PopoverCustomT-1" class="btn btn-primary btn-sm">Details</button>
                            </td>
                        </tr>
                        {/each}
                        </tbody>
                    </table>
                    
                </div>
                {/if}
                {#if vendors && vendors.length &&  last_page > 1 && !is_filter}
                    <Pagination on:message={handle_pagination} current_page={current_page} last_page={last_page} />
                {/if}
                </div>
                    {#if vendors && !vendors.length && !loader }
                        <Empty title="No Vendors" subtitle="No data for this query" />
                    {/if}
                    {#if loader}
                        <Loader />
                    {/if}
                
                
                
                    
               
                
            </div>
        </div>
         {/if}
        {#if mode === 1}
                <div class="container">
                    <div class="row justify-content-center align-items-center">
                        <div class="col-md-8">
                            <div class="main-card mb-3 card">
                                <div class="card-header" style="margin-bottom: 0px">
                                    <h5 class="card-title">{ form_action } Vendor</h5>
                                    <div class="btn-actions-pane-right">
                                        <button on:click={reset} class="btn btn-light btn-icon"><i class="pe-7s-close-circle"></i></button>
                                    </div>
                                </div>
                            <form>
                                <div class="row">
                                <div class="col-md-6">
                                        <input id="fileUpload" type="file" bind:files on:change={() => preview()}>
                                    </div>
                                    <div class="col-md-6">
                                        {#if files && files[0]}
                                            <img alt="" src="{create_preview}" class="rounded float-right" width="100px" height="100px"/>
                                        {/if}
                                        {#if !files && create_preview}
                                            <img alt="" src="{create_preview}" class="rounded float-right" width="100px" height="100px"/>
                                        {/if}
                                    </div>
                                    <div class="col-md-6">
                                        <label>Name</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.name} placeholder="Name"  required>
                                    </div>
                                    <div class="col-md-6">
                                        <label>Email</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.email} placeholder="Email"  required>
                                    </div>
                                    <!-- <div class="col-md-6">
                                        <label>State</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.state} placeholder=""  required>
                                    </div>
                                    <div class="col-md-6">
                                        <label>City</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.city} placeholder=""  required>
                                    </div> -->
                                    <div class="col-md-6">
                                        <label>Address</label>
                                        <input type="text" class="form-control" bind:value={query_address} placeholder="" list="browsers" required>
                                        {#if autocomplete_items && autocomplete_items.length }
                                        <ul class="list-group">
                                             {#each autocomplete_items as address}
                                             <li class="list-group-item" on:click={() => set_selected_address(address)}>{address.description}</li>
                                             {/each}
                                        </ul>
                                        {/if}
                                        <!-- <datalist id="browsers">
                                            <option value="Firefox">
                                            {#each autocomplete_items as address}
                                            <option on:click={() => set_selected_address(address)}  value="{address.description}">
                                            {/each}
                                        </datalist> -->
                                    </div>
                                    <div class="col-md-6">
                                        <label>Mobile Number</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.mobile_no} placeholder=""  required>
                                    </div>
                                    <!-- <div class="col-md-6">
                                        <label>Open Time</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.open_time} placeholder=""  required>
                                    </div>
                                    <div class="col-md-6">
                                        <label>Close Time</label>
                                        <input type="text" class="form-control" bind:value={vendor_form.close_time} placeholder=""  required>
                                    </div>
                                    <div class="col-md-6">
                                        <label>Non Working Days</label>
                                        <select bind:value={vendor_form.non_working_days} class="form-control form-control-sm">
                                            <option value="" selected>Working Days</option>
                                            {#each options as option, i}
                                                <option value={option.value} >{option.name}</option>
                                            {/each}
                                        </select>
                                    </div> -->
                                    <div class="col-md-6">
                                        <label>Account Type</label>
                                        <select bind:value={vendor_form.vendor_type_id} class="form-control form-control-sm">
                                            <option value="" selected>Account Type</option>
                                            {#each vendor_types as type, i}
                                                <option value={type.id} >{type.name}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label>Account Status</label>
                                        <select bind:value={vendor_form.status} class="form-control form-control-sm">
                                            <option value="" selected>Account Status</option>
                                            <option value="Active"> Activate</option>
                                            <option value="Suspended">Suspended </option>
                                            <option value="Pending">Pending</option>
                                            <option value="Closed"> Closed</option>
                                        </select>
                                    </div>
                                    <div class="col-md-12">
                                        <label>Description</label>
                                        <textarea type="textarea" bind:value={vendor_form.description} rows="4" class="form-control"></textarea>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-6">
                                    <button type="button" on:click={() => createAction(vendor_form)} disabled={!checkValid} class="btn btn-primary px-4">{ form_action }</button>
                                    </div>
                                    <div class="col-6 text-right">
                                    <button type="button" class="btn btn-danger" on:click={reset}>Cancel</button>
                                    </div>
                                </div>
                                
                            </form>
                        </div>
                    </div>
                </div>
            </div>
         {/if}
    </div>

</div>
#################
## APPLICATION ##
#################

app = angular.module 'openStackBackupManager', [ "ngAnimate", "ngRoute", "mgcrea.ngStrap", "angularMoment", "ngResource" ]
        .config [ '$locationProvider', '$routeProvider', ($locationProvider, $routeProvider) ->
            $locationProvider.html5Mode true

            $routeProvider
                .when("/clients",
                    templateUrl: "/static/partials/list.tpl.html",
                    controller: "ClientCtrl"
                )
                .when("/clients/new"
                    templateUrl: "/static/partials/new.tpl.html",
                    controller: "ClientAddCtrl"
                )
                .when("/jobs"
                    templateUrl: "/static/partials/jobs.tpl.html",
                    controller: "JobsCtrl"
                )
                .otherwise(
                    redirectTo: '/clients'
                )

            return
        ]

###############
## FACTORIES ##
###############

# Fetches clients from the clients endpoint
app.factory 'Client', [ '$resource', ($resource) ->
    $resource '/api/clients/:clientId', { clientId: "@_id" },
        # Requests list of clients
        query: method: 'GET', isArray: true
        # Saves a modified client
        save: method: 'POST'
]

# Fetches servers for a specified client, used on creation
app.factory 'Server', [ '$resource', ($resource) ->
    $resource '/api/servers', {},
        # Requests a list of servers for the posted client
        query: method: 'POST', isArray: true
]

# Fetches jobs in the queue and finished
app.factory 'Job', [ '$resource', ($resource) ->
    $resource '/api/jobs/:jobid', { jobid: "@_id" },
        # Requests jobs from the database
        query: method: 'GET', isArray: true
        # Saves a modified job
        save: method: 'POST'
        # Removes a job
        delete: method: 'DELETE'
]

#################
## CONTROLLERS ##
#################

# Controlls the jobs pane
app.controller 'JobsCtrl', [ 'Job', '$scope', (Job, $scope) ->
    $scope.loading = true

    $scope.jobs = []

    $scope.detailedJob = null

    # Default sort predicate
    $scope.jobPredicate = '-created'
    $scope.jobPredicateReverse = false
    $scope.jobLimit = 10

    $scope.viewDetailJob = (job) ->
        $scope.detailedJob = job
        return

    $scope.refreshJobs = ->
        $scope.loading = true
        $scope.jobs = Job.query ->
            $scope.loading = false
            return

    $scope.getStatusClass = (job) ->
        if job.deleting
            "glyphicon glyphicon-trash"
        else if job.status is 'completed'
            "glyphicon glyphicon-ok"
        else if job.status is 'queued'
            "glyphicon glyphicon-time"

    $scope.getDateInformation = (job) ->
        if job.status is 'completed'
            "Completed #{moment(job.finished).format('MMM d @ h:mma')}"
        else if job.status is 'queued'
            "Queued for #{moment(job.queued_for).format('MMM d @ h:mma')}"

    $scope.removeJob = (job) ->
        # Indicate that we are deleting this job
        job.deleting = true

        # Call the delete function
        job.$delete ->
            # Remove it from the list
            $scope.jobs.splice($scope.jobs.indexOf(job), 1)

            return

        return

    $scope.refreshJobs()

    return
]

app.controller 'ServerCtrl', [ 'Job', '$scope', '$location', '$alert', (Job, $scope, $location, $alert) ->
    $scope.current_job = {}
    $scope.button_confirm_text = ""
    $scope.confirm_dialog = {}

    # Perform backup confirmation
    $scope.queueJob = ($hide) ->
        $scope.confirm_dialog.loading = true

        # Create new job from data
        job = new Job $scope.current_job
        job.$save ->
            $hide()

            # Done performing the job
            $scope.confirm_dialog.loading = false

            # Clear the job
            $scope.current_job = {}

            # Go to the jobs page
            $location.path "/jobs"

            # Alert that the change was completed
            $alert
                title: 'Job Created'
                content: "The job has been posted"
                placement: 'top-right'
                show: true
                type: 'success'
                duration: 8

            return

        return

    # Cancels a job creation
    $scope.cancelJob = ->
        # Clear the job object
        $scope.current_job = {}

        return

    # Prepares the current job object for a restore operation
    $scope.prepareRestoreImage = (server, backup) ->
        # Delete job data
        $scope.current_job =
            type: "restore_server"
            client: $scope.selected_client._id
            server: server.id
            image: backup.id

        # Sets the text for the confirm button
        $scope.confirm_dialog.confirm_text = "Restore from Backup"

        $scope.confirm_dialog.confirm = $scope.queueJob
        $scope.confirm_dialog.cancel = $scope.cancelJob
        $scope.confirm_dialog.loading = false

        return

    # Prepares the current job object for a destroy operation
    $scope.prepareDestroyJob = (server) ->
        $scope.confirm_dialog.confirm_text = "Destroy Server"

        # Delete job details
        $scope.current_job =
            type: "delete_server"
            client: $scope.selected_client._id
            server: server.id


        $scope.confirm_dialog.confirm = $scope.queueJob
        $scope.confirm_dialog.cancel = $scope.cancelJob
        $scope.confirm_dialog.loading = false

        return

    $scope.prepareDeleteImageJob = (server, backup) ->
        # Delete job data
        $scope.current_job =
            type: "delete_image"
            client: $scope.selected_client._id
            server: server.id
            image: backup.id

        $scope.confirm_dialog.confirm_text = "Delete Backup"

        $scope.confirm_dialog.confirm = $scope.queueJob
        $scope.confirm_dialog.cancel = $scope.cancelJob
        $scope.confirm_dialog.loading = false

        return

    $scope.prepareBackupJob = (server) ->
        # Backup job data
        $scope.current_job =
            type: "create_image"
            client: $scope.selected_client._id
            server: server.id
            name: "#{server.name} - Backup #{moment().format("MMMM, D YYYY")}"

        $scope.confirm_dialog.confirm_text = "Queue Backup"

        $scope.confirm_dialog.confirm = $scope.queueJob
        $scope.confirm_dialog.cancel = $scope.cancelJob
        $scope.confirm_dialog.loading = false

        return

    # TODO: Add ngResource
    $scope.prepareToggleBackups = (server, animation) ->
        $scope.confirm_dialog.confirm_text = "Confirm"

        $scope.confirm_dialog.confirm = ($hide) ->
            $scope.confirm_dialog.loading = true

            # Toggle the value
            if server.backups_enabled?
                server.backups_enabled = !server.backups_enabled
            else
                server.backups_enabled = true

            # Now, find the selected client that needs to be updated
            $scope.selected_client.$save () ->
                $hide()

                $scope.confirm_dialog.loading = false

                # Alert that the change was completed
                $alert
                    title: 'Change finished!'
                    content: "#{server.name} now has backups #{ if server.backups_enabled then 'enabled' else 'disabled' }."
                    placement: 'top-right'
                    show: true
                    type: 'success'
                    duration: 8

                return

            return

        $scope.confirm_dialog.cancel = () ->
            return


    $scope.toggleBackupsButtonText = (server) ->
        if server.backups_enabled? and server.backups_enabled
            "Disable Automated Backups"
        else
            "Enable Automated Backups"
]

app.controller 'ClientCtrl', [ 'Client', '$scope', '$location', (Client, $scope, $location) ->
    $scope.clients = []
    $scope.selected_client = null
    $scope.loading = true

    $scope.newClient = {}

    $scope.selectClient = (client) ->
        $scope.selected_client = client
        return

    $scope.loadClients = ->
        $scope.loading = true
        $scope.selected_client = null

        $scope.clients = Client.query ->
            $scope.loading = false
            return

        return

    $scope.loadClients()

    return
]

app.controller 'ClientAddCtrl', [ 'Client', 'Server', '$http', '$scope', '$location', (Client, Server, $http, $scope, $location) ->
    $scope.step = 1
    $scope.loading = false
    $scope.loading_text = ""

    # Clear out the client by default
    $scope.client =
        servers: []
        account:
            password: ""
            name: ""
            userName: ""

    $scope.current_step = 1

    $scope.providers = [
        {
            name: "CloudA"
            authUrl: "http://api.cell01.clouda.ca:5000"
            region: "regionOne"
        }
    ]
    $scope.selectedProvider = $scope.providers[0]

    $scope.listServers = ->
        $scope.loading = true

        # Select provider
        $scope.client.account.authUrl = $scope.selectedProvider.authUrl
        $scope.client.account.region = $scope.selectedProvider.region

        # Fetch all the servers for the client
        $scope.client.servers = Server.query $scope.client, ->
            $scope.loading = false
            return

        return

    $scope.toggleServer = (server) ->
        if server.backups_enabled
            server.backups_enabled = false
        else
            server.backups_enabled = true

        return

    addClient = ->
        delete $scope.client.server_list
        $scope.loading = true
        newClient = new Client $scope.client
        newClient.$save ->
            $scope.loading = false
            $location.path "/"

    $scope.nextStep = ->
        $scope.current_step++

        if $scope.current_step == 2
            $scope.listServers()
        else if $scope.current_step == 4
            addClient()

]
